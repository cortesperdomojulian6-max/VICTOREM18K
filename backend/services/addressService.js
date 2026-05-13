const db = require('../db');
const { ValidationError, NotFoundError } = require('./errors');

async function getAddresses(userId) {
  const result = await db.query(
    `SELECT id, alias, destinatario, ciudad, departamento, direccion, telefono
     FROM addresses WHERE user_id = $1 ORDER BY id DESC`,
    [userId]
  );
  return result.rows;
}

async function createAddress(userId, { destinatario, ciudad, departamento, direccion, telefono, alias }) {
  if (!destinatario || !ciudad || !departamento || !direccion || !telefono) {
    throw new ValidationError('Faltan campos requeridos');
  }

  const result = await db.query(
    `INSERT INTO addresses (user_id, alias, destinatario, ciudad, departamento, direccion, telefono)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, alias, destinatario, ciudad, departamento, direccion, telefono`,
    [userId, alias || null, destinatario, ciudad, departamento, direccion, telefono]
  );

  return result.rows[0];
}

async function updateAddress(userId, addressId, fields) {
  const { destinatario, ciudad, departamento, direccion, telefono, alias } = fields;

  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (alias !== undefined) { updates.push(`alias = $${paramIndex}`); values.push(alias); paramIndex++; }
  if (destinatario !== undefined) { updates.push(`destinatario = $${paramIndex}`); values.push(destinatario); paramIndex++; }
  if (ciudad !== undefined) { updates.push(`ciudad = $${paramIndex}`); values.push(ciudad); paramIndex++; }
  if (departamento !== undefined) { updates.push(`departamento = $${paramIndex}`); values.push(departamento); paramIndex++; }
  if (direccion !== undefined) { updates.push(`direccion = $${paramIndex}`); values.push(direccion); paramIndex++; }
  if (telefono !== undefined) { updates.push(`telefono = $${paramIndex}`); values.push(telefono); paramIndex++; }

  if (updates.length === 0) {
    throw new ValidationError('No hay campos para actualizar');
  }

  values.push(addressId, userId);
  const query = `UPDATE addresses
                 SET ${updates.join(', ')}
                 WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
                 RETURNING id, alias, destinatario, ciudad, departamento, direccion, telefono`;

  const result = await db.query(query, values);
  if (result.rowCount === 0) {
    throw new NotFoundError('Dirección no encontrada');
  }

  return result.rows[0];
}

async function deleteAddress(userId, addressId) {
  const result = await db.query(
    'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
    [addressId, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('Dirección no encontrada');
  }

  return { ok: true, deletedId: result.rows[0].id };
}

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress };
