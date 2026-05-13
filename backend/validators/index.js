function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email requerido';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Email inválido';
  if (email.length > 254) return 'Email demasiado largo';
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Contraseña requerida';
  if (password.length < 6) return 'Mínimo 6 caracteres';
  if (password.length > 128) return 'Máximo 128 caracteres';
  return null;
}

function validateName(name) {
  if (!name || typeof name !== 'string') return 'Nombre requerido';
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Mínimo 2 caracteres';
  if (trimmed.length > 100) return 'Máximo 100 caracteres';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmed)) return 'Nombre contiene caracteres inválidos';
  return null;
}

function validateAddress(data) {
  const errors = {};
  if (!data.destinatario || data.destinatario.trim().length < 3) errors.destinatario = 'Destinatario requerido (mín. 3 caracteres)';
  if (!data.direccion || data.direccion.trim().length < 5) errors.direccion = 'Dirección requerida (mín. 5 caracteres)';
  if (!data.ciudad || data.ciudad.trim().length < 2) errors.ciudad = 'Ciudad requerida';
  if (!data.departamento || data.departamento.trim().length < 2) errors.departamento = 'Departamento requerido';
  if (!data.telefono || !/^[+\d\s()-]{7,20}$/.test(data.telefono.trim())) errors.telefono = 'Teléfono inválido';
  return Object.keys(errors).length ? errors : null;
}

function validateProduct(data) {
  const errors = {};
  if (!data.name || data.name.trim().length < 2) errors.name = 'Nombre requerido';
  if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) errors.price = 'Precio debe ser mayor a 0';
  return Object.keys(errors).length ? errors : null;
}

function validateLogin(body) {
  const emailErr = validateEmail(body.email);
  if (emailErr) return emailErr;
  const pwdErr = validatePassword(body.password);
  if (pwdErr) return pwdErr;
  return null;
}

function validateRegister(body) {
  const nameErr = validateName(body.name);
  if (nameErr) return nameErr;
  const emailErr = validateEmail(body.email);
  if (emailErr) return emailErr;
  const pwdErr = validatePassword(body.password);
  if (pwdErr) return pwdErr;
  return null;
}

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateAddress,
  validateProduct,
  validateLogin,
  validateRegister
};
