

    // Sistema de autenticación
    document.addEventListener('DOMContentLoaded', function() {
      // Elementos del DOM
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

      // Verificar si el usuario ya está autenticado
      function checkAuthStatus() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
          // Usuario autenticado - CORREGIDO: Agregar enlace a miperfil.html
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
          
          // Agregar eventos para los enlaces del menú de usuario
          document.getElementById('logoutLink').addEventListener('click', logout);
        } else {
          // Usuario no autenticado
          authNav.innerHTML = `
            <li><a href="#" id="loginLink">Iniciar Sesión</a></li>
          `;
          document.getElementById('loginLink').addEventListener('click', showLoginModal);
        }
      }

      // Mostrar modal de inicio de sesión
      function showLoginModal() {
        loginModal.style.display = 'flex';
      }

      // Mostrar modal de registro
      function showRegisterModal() {
        registerModal.style.display = 'flex';
      }

      // Cerrar modales
      function closeModals() {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
        loginError.style.display = 'none';
        loginSuccess.style.display = 'none';
        registerError.style.display = 'none';
        registerSuccess.style.display = 'none';
      }

      // Iniciar sesión
      function login(email, password) {
        // Obtener usuarios del localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Buscar usuario
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          // Guardar usuario actual en localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Mostrar mensaje de éxito
          loginSuccess.textContent = '¡Inicio de sesión exitoso!';
          loginSuccess.style.display = 'block';
          
          // Actualizar interfaz después de un breve retraso
          setTimeout(() => {
            closeModals();
            checkAuthStatus();
          }, 1500);
          
          return true;
        } else {
          // Mostrar mensaje de error
          loginError.textContent = 'Correo electrónico o contraseña incorrectos';
          loginError.style.display = 'block';
          return false;
        }
      }

      // Registrar nuevo usuario
      function register(name, email, password) {
        // Obtener usuarios del localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Verificar si el usuario ya existe
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
          registerError.textContent = 'Ya existe un usuario con este correo electrónico';
          registerError.style.display = 'block';
          return false;
        }
        
        // Crear nuevo usuario
        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          password,
          registrationDate: new Date().toISOString()
        };
        
        // Guardar usuario
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Iniciar sesión automáticamente
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Mostrar mensaje de éxito
        registerSuccess.textContent = '¡Cuenta creada exitosamente!';
        registerSuccess.style.display = 'block';
        
        // Actualizar interfaz después de un breve retraso
        setTimeout(() => {
          closeModals();
          checkAuthStatus();
        }, 1500);
        
        return true;
      }

      // Cerrar sesión
      function logout() {
        localStorage.removeItem('currentUser');
        checkAuthStatus();
      }

      // Validar formulario de registro
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

      // Event Listeners
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

      // Cerrar modal al hacer clic fuera del contenido
      window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
          closeModals();
        }
        if (e.target === registerModal) {
          closeModals();
        }
      });

      // Inicializar estado de autenticación
      checkAuthStatus();
    });
    
