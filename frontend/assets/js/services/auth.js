function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

function hideElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

export async function register(formData) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return res;
}

export async function login(formData) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return res;
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  } catch {
    return null;
  }
}

export function updateAuthNav() {
  const authNav = document.getElementById('auth-nav');
  if (!authNav) return;

  const user = getCurrentUser();
  if (isAuthenticated() && user) {
    authNav.innerHTML = `
      <span class="auth-welcome">Hola, ${user.name}</span>
      <button id="logoutButton" class="auth-nav-btn">Cerrar sesión</button>
    `;
  } else {
    authNav.innerHTML = `
      <button id="showLoginButton" class="auth-nav-btn">Iniciar sesión</button>
      <button id="showRegisterButton" class="auth-nav-btn btn-outline">Regístrate</button>
    `;
  }
}

export function showLoginModal() { showElement('loginModal'); }
export function showRegisterModal() { showElement('registerModal'); }

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  updateAuthNav();
  window.location.reload();
}

function attachAuthEvents() {
  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (!target) return;

    if (target.matches('#showLogin, #showLoginButton')) {
      event.preventDefault();
      showLoginModal();
    }

    if (target.matches('#showRegister, #showRegisterButton')) {
      event.preventDefault();
      showRegisterModal();
    }

    if (target.matches('#logoutButton')) {
      event.preventDefault();
      logout();
    }
  });
}

function attachAuthFormEvents() {
  const registerForm = document.getElementById('registerForm');
  const registerError = document.getElementById('registerError');
  const registerSuccess = document.getElementById('registerSuccess');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (registerError) registerError.textContent = '';
      if (registerSuccess) registerSuccess.textContent = '';

      const name = document.getElementById('registerName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const confirm = document.getElementById('registerConfirmPassword').value;

      if (password !== confirm) {
        if (registerError) registerError.textContent = 'Las contraseñas no coinciden.';
        return;
      }

      try {
        const res = await register({ name, email, password });
        const data = await res.json().catch(() => ({}));
        if (res.status === 201) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('currentUser', JSON.stringify({ id: data.id, name: data.name, email: data.email }));
          if (registerSuccess) registerSuccess.textContent = 'Registro exitoso.';
          updateAuthNav();
          setTimeout(() => hideElement('registerModal'), 800);
        } else {
          if (registerError) registerError.textContent = data.error || 'Error en el registro.';
        }
      } catch {
        if (registerError) registerError.textContent = 'Error al conectar con el servidor.';
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (loginError) loginError.textContent = '';

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        const res = await login({ email, password });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('currentUser', JSON.stringify({ id: data.id, name: data.name, email: data.email }));
          updateAuthNav();
          hideElement('loginModal');
        } else {
          if (loginError) loginError.textContent = data.error || 'Login fallido.';
        }
      } catch {
        if (loginError) loginError.textContent = 'Error al conectar con el servidor.';
      }
    });
  }

  const closeLogin = document.getElementById('closeLogin');
  const closeRegister = document.getElementById('closeRegister');
  if (closeLogin) closeLogin.addEventListener('click', () => hideElement('loginModal'));
  if (closeRegister) closeRegister.addEventListener('click', () => hideElement('registerModal'));
}

export function initAuth() {
  attachAuthEvents();
  attachAuthFormEvents();
  updateAuthNav();
}
