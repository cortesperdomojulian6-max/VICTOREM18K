
const db = require('../db');
const { ForbiddenError } = require('./errors');

async function getDashboardStats() {
  // 1. Ventas totales y cantidad de pedidos
  const statsResult = await db.query(`
    SELECT 
      COUNT(*) as total_orders,
      SUM(CASE WHEN estado = 'confirmado' THEN total ELSE 0 END) as total_revenue,
      SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pending_orders,
      SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelled_orders
    FROM orders
  `);

  // 2. Producto más vendido
  const topProductsResult = await db.query(`
    SELECT p.name, SUM(oi.cantidad) as total_sold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.name
    ORDER BY total_sold DESC
    LIMIT 5
  `);

  return {
    summary: statsResult.rows[0],
    topProducts: topProductsResult.rows
  };
}

async function getOrdersForCsv() {
  const result = await db.query(`
    SELECT 
      o.fecha, o.numero_pedido, u.name as cliente, u.email, o.total, o.estado,
      ad.direccion, ad.ciudad
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN addresses ad ON o.address_id = ad.id
    ORDER BY o.fecha DESC
  `);
  return result.rows;
}

module.exports = { getDashboardStats, getOrdersForCsv };
