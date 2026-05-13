const bcrypt = require('bcrypt');
const db = require('../db');
const { ValidationError, UnauthorizedError } = require('./errors');

function getProfile(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url || null,
    registration_date: user.registration_date
  };
}

async function updateProfile(userId, { name, email, avatar_url }) {
  if (!name && avatar_url === undefined && email === undefined) {
    throw new ValidationError('No hay campos para actualizar');
  }

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (name) {
    const sanitized = name.trim().replace(/<[^>]*>/g, '').substring(0, 100);
    fields.push(`name = $${paramIndex++}`);
    values.push(sanitized);
  }
  if (email !== undefined) {
    const trimmed = email.trim().toLowerCase();
    fields.push(`email = $${paramIndex++}`);
    values.push(trimmed);
  }
  if (avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramIndex++}`);
    values.push(avatar_url);
  }

  if (fields.length === 0) {
    throw new ValidationError('No hay campos para actualizar');
  }

  values.push(userId);
  const result = await db.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, role, avatar_url`,
    values
  );

  return result.rows[0];
}

async function changePassword(userId, { old_password, new_password }) {
  if (!old_password || !new_password) {
    throw new ValidationError('Contraseñas requeridas');
  }

  const userResult = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
  const user = userResult.rows[0];

  const isValid = await bcrypt.compare(old_password, user.password);
  if (!isValid) {
    throw new UnauthorizedError('Contraseña actual incorrecta');
  }

  const hashed = await bcrypt.hash(new_password, 10);
  await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

  return { ok: true, message: 'Contraseña actualizada' };
}

async function deleteAccount(userId) {
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
  return { ok: true, message: 'Cuenta eliminada' };
}

module.exports = { getProfile, updateProfile, changePassword, deleteAccount };
