const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, alias, destinatario, ciudad, departamento, direccion, telefono 
       FROM addresses 
       WHERE user_id = $1
       ORDER BY id DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/addresses:', err);
    return res.status(500).json({ error: 'Error al obtener direcciones' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { destinatario, ciudad, departamento, direccion, telefono, alias } = req.body;
    if (!destinatario || !ciudad || !departamento || !direccion || !telefono) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await db.query(
      `INSERT INTO addresses (user_id, alias, destinatario, ciudad, departamento, direccion, telefono)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, alias, destinatario, ciudad, departamento, direccion, telefono`,
      [req.user.id, alias || null, destinatario, ciudad, departamento, direccion, telefono]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error en POST /api/addresses:', err);
    return res.status(500).json({ error: 'Error al crear dirección' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { destinatario, ciudad, departamento, direccion, telefono, alias } = req.body;
    const addressId = parseInt(req.params.id, 10);

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (alias !== undefined) {
      updates.push(`alias = $${paramIndex}`);
      values.push(alias);
      paramIndex++;
    }
    if (destinatario !== undefined) {
      updates.push(`destinatario = $${paramIndex}`);
      values.push(destinatario);
      paramIndex++;
    }
    if (ciudad !== undefined) {
      updates.push(`ciudad = $${paramIndex}`);
      values.push(ciudad);
      paramIndex++;
    }
    if (departamento !== undefined) {
      updates.push(`departamento = $${paramIndex}`);
      values.push(departamento);
      paramIndex++;
    }
    if (direccion !== undefined) {
      updates.push(`direccion = $${paramIndex}`);
      values.push(direccion);
      paramIndex++;
    }
    if (telefono !== undefined) {
      updates.push(`telefono = $${paramIndex}`);
      values.push(telefono);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(addressId, req.user.id);
    const query = `UPDATE addresses 
                   SET ${updates.join(', ')}, updated_at = NOW()
                   WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
                   RETURNING id, alias, destinatario, ciudad, departamento, direccion, telefono`;

    const result = await db.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en PUT /api/addresses/:id:', err);
    return res.status(500).json({ error: 'Error al actualizar dirección' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const addressId = parseInt(req.params.id, 10);
    const result = await db.query(
      `DELETE FROM addresses 
       WHERE id = $1 AND user_id = $2 
       RETURNING id`,
      [addressId, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }
    return res.json({ ok: true, deletedId: result.rows[0].id });
  } catch (err) {
    console.error('Error en DELETE /api/addresses/:id:', err);
    return res.status(500).json({ error: 'Error al eliminar dirección' });
  }
});

module.exports = router;