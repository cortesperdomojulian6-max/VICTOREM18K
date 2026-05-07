const bcrypt = require('bcrypt');
const db = require('../db');
const { ValidationError, UnauthorizedError } = require('./errors');

function getProfile(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    registration_date: user.registration_date
  };
}

async function updateProfile(userId, { name }) {
  if (!name) {
    throw new ValidationError('Nombre requerido');
  }

  const result = await db.query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role',
    [name.trim(), userId]
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
