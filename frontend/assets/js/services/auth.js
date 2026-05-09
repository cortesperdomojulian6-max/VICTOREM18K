function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

function hideElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

async function register(formData) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return res;
}

async function login(formData) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return res;
}

function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  } catch {
    return null;
  }
}

function updateAuthNav() {
  const authNav = document.getElementById('auth-nav');
  if (!authNav) return;

  const user = getCurrentUser();
  if (isAuthenticated() && user) {
    const inicial = (user.name || 'U').charAt(0).toUpperCase();
    authNav.innerHTML = `
      <div class="user-menu">
        <button class="user-menu-btn">
          <span class="user-avatar">${inicial}</span>
          <span class="user-name">${user.name}</span>
          <span class="user-arrow">&#9662;</span>
        </button>
        <div class="user-dropdown">
          <div class="dropdown-header">
            <span class="dropdown-avatar">${inicial}</span>
            <div class="dropdown-user-info">
              <span class="dropdown-user-name">${user.name}</span>
              <span class="dropdown-user-email">${user.email || ''}</span>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <a href="miperfil.html" class="dropdown-item">
            <span class="dropdown-icon">&#128100;</span> Mi Perfil
          </a>
          <a href="miperfil.html#pedidos" class="dropdown-item">
            <span class="dropdown-icon">&#128230;</span> Mis Pedidos
          </a>
          <a href="miperfil.html#carrito" class="dropdown-item">
            <span class="dropdown-icon">&#128722;</span> Mi Carrito
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" id="logoutButton" class="dropdown-item dropdown-logout">
            <span class="dropdown-icon">&#128682;</span> Cerrar sesión
          </a>
        </div>
      </div>
    `;
  } else {
    authNav.innerHTML = `
      <button id="showLoginButton" class="auth-nav-btn">Iniciar sesión</button>
      <button id="showRegisterButton" class="auth-nav-btn btn-outline">Regístrate</button>
    `;
  }
}

function showLoginModal() { showElement('loginModal'); }
function showRegisterModal() { showElement('registerModal'); }

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

  function showMsg(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMsg(registerError, '');
      showMsg(registerSuccess, '');

      const name = document.getElementById('registerName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const confirm = document.getElementById('registerConfirmPassword').value;

      if (password !== confirm) {
        showMsg(registerError, 'Las contraseñas no coinciden.');
        return;
      }

      try {
        const res = await register({ name, email, password });
        const data = await res.json().catch(() => ({}));
        if (res.status === 201) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('currentUser', JSON.stringify({ id: data.id, name: data.name, email: data.email }));
          showMsg(registerSuccess, 'Registro exitoso. Redirigiendo...');
          updateAuthNav();
          setTimeout(() => hideElement('registerModal'), 1200);
        } else {
          showMsg(registerError, data.error || 'Error en el registro.');
        }
      } catch {
        showMsg(registerError, 'Error al conectar con el servidor.');
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMsg(loginError, '');

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
          showMsg(loginError, data.error || 'Login fallido.');
        }
      } catch {
        showMsg(loginError, 'Error al conectar con el servidor.');
      }
    });
  }

  const closeLogin = document.getElementById('closeLogin');
  const closeRegister = document.getElementById('closeRegister');
  if (closeLogin) closeLogin.addEventListener('click', () => hideElement('loginModal'));
  if (closeRegister) closeRegister.addEventListener('click', () => hideElement('registerModal'));
}

function initCart() {
  const cartIcon = document.getElementById('cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', function() {
      if (!isAuthenticated()) {
        alert('Por favor, inicia sesión para ver tu carrito.');
        showLoginModal();
        return;
      }
      window.location.href = 'miperfil.html#carrito';
    });
  }
}

function initAuth() {
  attachAuthEvents();
  attachAuthFormEvents();
  updateAuthNav();
  initCart();
}

window.register = register;
window.login = login;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.updateAuthNav = updateAuthNav;
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.initAuth = initAuth;
