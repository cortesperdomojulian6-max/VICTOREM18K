// ============================================================
// VICTOREM - Rutas de administración
// ============================================================
// Todas las rutas exigen autenticación + rol admin.
// ============================================================

const express = require('express');
const db = require('./db');
const { requireAuth, requireAdmin } = require('./middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticación + admin a todas las rutas
router.use(requireAuth, requireAdmin);

// ----------------- GET /api/admin/users -----------------
// Lista todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, registration_date
         FROM users
         ORDER BY registration_date DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /admin/users:', err);
    return res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

// ----------------- DELETE /api/admin/users/:id -----------------
// Elimina un usuario (no se puede eliminar a sí mismo)
router.delete('/users/:id', async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    if (targetId === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de admin' });
    }

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [targetId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json({ ok: true, deletedId: result.rows[0].id });
  } catch (err) {
    console.error('Error en DELETE /admin/users/:id:', err);
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// ----------------- GET /api/admin/stats -----------------
// Estadísticas generales (extra útil para el panel)
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users)      AS total_usuarios,
        (SELECT COUNT(*)::int FROM products WHERE active = true) AS total_productos,
        (SELECT COUNT(*)::int FROM orders)     AS total_pedidos,
        (SELECT COALESCE(SUM(total), 0)::float FROM orders WHERE estado = 'pagado') AS ingresos
    `);
    return res.json(stats.rows[0]);
  } catch (err) {
    console.error('Error en GET /admin/stats:', err);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
