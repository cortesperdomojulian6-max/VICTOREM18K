import { loadSharedHeader } from '../components/header-loader.js';

document.addEventListener('DOMContentLoaded', function() {
  loadSharedHeader();

  const authNav = document.getElementById('auth-nav');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const closeLogin = document.getElementById('closeLogin');
  const closeRegister = document.getElementById('closeRegister');
  const loginError = document.getElementById('loginError');
  const loginSuccess = document.getElementById('loginSuccess');
  const registerError = document.getElementById('registerError');
  const registerSuccess = document.getElementById('registerSuccess');

  function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      authNav.innerHTML = `
        <div class="user-menu">
          <button class="user-menu-btn">
            <span>${user.name}</span>
            <span>▼</span>
          </button>
          <div class="user-dropdown">
            <a href="miperfil.html" id="profileLink">Mi Perfil</a>
            <a href="#" id="logoutLink">Cerrar Sesión</a>
          </div>
        </div>
      `;
      document.getElementById('logoutLink').addEventListener('click', logout);
    } else {
      authNav.innerHTML = `<li><a href="#" id="loginLink">Iniciar Sesión</a></li>`;
      document.getElementById('loginLink').addEventListener('click', showLoginModal);
    }
  }

  function showLoginModal() { loginModal.style.display = 'flex'; }
  function showRegisterModal() { registerModal.style.display = 'flex'; }

  function closeModals() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
    if (loginError) loginError.style.display = 'none';
    if (loginSuccess) loginSuccess.style.display = 'none';
    if (registerError) registerError.style.display = 'none';
    if (registerSuccess) registerSuccess.style.display = 'none';
  }

  function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      loginSuccess.textContent = '¡Inicio de sesión exitoso!';
      loginSuccess.style.display = 'block';
      setTimeout(() => { closeModals(); checkAuthStatus(); }, 1500);
      return true;
    } else {
      loginError.textContent = 'Correo electrónico o contraseña incorrectos';
      loginError.style.display = 'block';
      return false;
    }
  }

  function register(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      registerError.textContent = 'Ya existe un usuario con este correo electrónico';
      registerError.style.display = 'block';
      return false;
    }
    const newUser = { id: Date.now().toString(), name, email, password, registrationDate: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    registerSuccess.textContent = '¡Cuenta creada exitosamente!';
    registerSuccess.style.display = 'block';
    setTimeout(() => { closeModals(); checkAuthStatus(); }, 1500);
    return true;
  }

  function logout() {
    localStorage.removeItem('currentUser');
    checkAuthStatus();
  }

  function validateRegisterForm(name, email, password, confirmPassword) {
    if (password !== confirmPassword) {
      registerError.textContent = 'Las contraseñas no coinciden';
      registerError.style.display = 'block';
      return false;
    }
    if (password.length < 6) {
      registerError.textContent = 'La contraseña debe tener al menos 6 caracteres';
      registerError.style.display = 'block';
      return false;
    }
    return true;
  }

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    login(email, password);
  });

  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    if (validateRegisterForm(name, email, password, confirmPassword)) {
      register(name, email, password);
    }
  });

  showRegister.addEventListener('click', function(e) {
    e.preventDefault();
    closeModals();
    showRegisterModal();
  });

  showLogin.addEventListener('click', function(e) {
    e.preventDefault();
    closeModals();
    showLoginModal();
  });

  closeLogin.addEventListener('click', closeModals);
  closeRegister.addEventListener('click', closeModals);

  window.addEventListener('click', function(e) {
    if (e.target === loginModal) closeModals();
    if (e.target === registerModal) closeModals();
  });

  checkAuthStatus();
});
