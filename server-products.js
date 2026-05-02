// ============================================================
// VICTOREM - Rutas de Productos
// ============================================================
// GET    /api/products       -> lista todos los productos
// GET    /api/products/:id   -> detalle de un producto
// POST   /api/products       -> crear (solo admin)
// PUT    /api/products/:id   -> editar (solo admin)
// DELETE /api/products/:id   -> eliminar (solo admin)
// ============================================================

const express = require('express');
const db = require('./db');
const { requireAuth, requireAdmin } = require('./middleware/auth');

const router = express.Router();

// GET - Listar todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, description, price, image, category_id, active, created_at
       FROM products
       WHERE active = true
       ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/products:', err);
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET - Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await db.query(
      `SELECT id, name, description, price, image, category_id, active, created_at
       FROM products
       WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en GET /api/products/:id:', err);
    return res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// POST - Crear nuevo producto (solo admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category_id } = req.body || {};

    if (!name || price === undefined || !category_id) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await db.query(
      `INSERT INTO products (name, description, price, image, category_id, active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, name, description, price, image, category_id, active, created_at`,
      [name.trim(), description?.trim() || '', price, image || '', category_id]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error en POST /api/products:', err);
    return res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT - Editar producto (solo admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, price, image, active } = req.body || {};

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name.trim());
      paramIndex++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description.trim());
      paramIndex++;
    }
    if (price !== undefined) {
      updates.push(`price = $${paramIndex}`);
      values.push(price);
      paramIndex++;
    }
    if (image !== undefined) {
      updates.push(`image = $${paramIndex}`);
      values.push(image);
      paramIndex++;
    }
    if (active !== undefined) {
      updates.push(`active = $${paramIndex}`);
      values.push(active);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);
    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en PUT /api/products/:id:', err);
    return res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE - Eliminar producto (solo admin, soft delete)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const result = await db.query(
      `UPDATE products SET active = false WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.json({ ok: true, deletedId: result.rows[0].id });
  } catch (err) {
    console.error('Error en DELETE /api/products/:id:', err);
    return res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
