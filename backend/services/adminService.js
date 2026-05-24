const db = require('../db');
const { ValidationError, NotFoundError } = require('./errors');

async function getUsers() {
  const result = await db.query(
    `SELECT id, name, email, role, registration_date
     FROM users ORDER BY registration_date DESC`
  );
  return result.rows;
}

async function deleteUser(targetId, currentUserId) {
  const id = parseInt(targetId, 10);
  if (Number.isNaN(id)) {
    throw new ValidationError('ID inválido');
  }
  if (id === currentUserId) {
    throw new ValidationError('No puedes eliminar tu propia cuenta de admin');
  }

  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  if (result.rowCount === 0) {
    throw new NotFoundError('Usuario no encontrado');
  }

  return { ok: true, deletedId: result.rows[0].id };
}

async function getStats() {
  const stats = await db.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS total_usuarios,
      (SELECT COUNT(*)::int FROM products WHERE active = true) AS total_productos,
      (SELECT COUNT(*)::int FROM orders) AS total_pedidos,
      (SELECT COALESCE(SUM(total), 0)::float FROM orders WHERE estado IN ('confirmado', 'pagado', 'enviado', 'entregado')) AS ingresos
  `);
  return stats.rows[0];
}

async function getAllOrders() {
  const result = await db.query(`
    SELECT o.id, o.numero_pedido, o.total, o.estado, o.metodo_pago, o.fecha,
           u.name AS user_name, u.email AS user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.fecha DESC
  `);
  return result.rows;
}

async function updateOrderStatus(orderId, estado) {
  const id = parseInt(orderId, 10);
  if (Number.isNaN(id)) throw new ValidationError('ID inválido');

  const valid = ['pendiente', 'pagado', 'confirmado', 'enviado', 'entregado', 'cancelado'];
  if (!valid.includes(estado)) throw new ValidationError(`Estado inválido: ${estado}`);

  const result = await db.query(
    `UPDATE orders SET estado = $1 WHERE id = $2 RETURNING id, numero_pedido, estado`,
    [estado, id]
  );
  if (result.rowCount === 0) throw new NotFoundError('Orden no encontrada');

  return { ok: true, order: result.rows[0] };
}

async function getMayoreoAnalysis() {
  const orders = await db.query(`
    SELECT o.id, o.numero_pedido, o.total, o.estado, o.fecha,
           u.name AS user_name, u.email AS user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.total >= 500000
    ORDER BY o.fecha DESC
  `);

  const items = await db.query(`
    SELECT oi.order_id, oi.nombre_producto, SUM(oi.cantidad) as total_cantidad
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.total >= 500000
    GROUP BY oi.order_id, oi.nombre_producto
    ORDER BY oi.order_id
  `);

  const itemMap = {}
  for (const item of items.rows) {
    if (!itemMap[item.order_id]) itemMap[item.order_id] = []
    itemMap[item.order_id].push(`${item.total_cantidad}x ${item.nombre_producto}`)
  }

  const enriched = orders.rows.map(o => ({
    ...o,
    items: itemMap[o.id] || [],
    tiempo_estimado: `${Math.ceil(o.total / 50000)} horas (aprox)`,
  }))

  return {
    total_pedidos_mayoreo: orders.rows.length,
    ingresos_totales: orders.rows.reduce((s, o) => s + parseFloat(o.total || 0), 0),
    pedidos: enriched,
  }
}

module.exports = { getUsers, deleteUser, getStats, getAllOrders, updateOrderStatus, getMayoreoAnalysis };
