const db = require('../db');
const { ValidationError, NotFoundError } = require('./errors');

async function getAllProducts() {
  const result = await db.query(
    `SELECT p.id, p.name, p.description, p.price, p.image_url, p.category_id, c.slug as category, p.active, p.created_at
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.active = true ORDER BY p.created_at DESC`
  );
  return result.rows;
}

async function getProductById(id) {
  const productId = parseInt(id, 10);
  const result = await db.query(
    `SELECT p.id, p.name, p.description, p.price, p.image_url, p.category_id, c.slug as category, p.active, p.created_at
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1`,
    [productId]
  );
  if (result.rows.length === 0) {
    throw new NotFoundError('Producto no encontrado');
  }
  return result.rows[0];
}

async function createProduct({ name, description, price, image_url, category_id }) {
  if (!name || price === undefined || !category_id) {
    throw new ValidationError('Faltan campos requeridos');
  }

  const result = await db.query(
    `INSERT INTO products (name, description, price, image_url, category_id, active)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id, name, description, price, image_url, category_id, active, created_at`,
    [name.trim(), (description || '').trim(), price, image_url || '', category_id]
  );

  return result.rows[0];
}

async function updateProduct(id, fields) {
  const productId = parseInt(id, 10);
  const { name, description, price, image_url, active } = fields;

  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) { updates.push(`name = $${paramIndex}`); values.push(name.trim()); paramIndex++; }
  if (description !== undefined) { updates.push(`description = $${paramIndex}`); values.push(description.trim()); paramIndex++; }
  if (price !== undefined) { updates.push(`price = $${paramIndex}`); values.push(price); paramIndex++; }
  if (image_url !== undefined) { updates.push(`image_url = $${paramIndex}`); values.push(image_url); paramIndex++; }
  if (active !== undefined) { updates.push(`active = $${paramIndex}`); values.push(active); paramIndex++; }

  if (updates.length === 0) {
    throw new ValidationError('No hay campos para actualizar');
  }

  values.push(productId);
  const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, values);

  if (result.rowCount === 0) {
    throw new NotFoundError('Producto no encontrado');
  }

  return result.rows[0];
}

async function deleteProduct(id) {
  const productId = parseInt(id, 10);
  const result = await db.query(
    `UPDATE products SET active = false WHERE id = $1 RETURNING id`,
    [productId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('Producto no encontrado');
  }

  return { deletedId: result.rows[0].id };
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
