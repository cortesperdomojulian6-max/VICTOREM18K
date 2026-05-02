// Mi Perfil - Refactorizado para usar APIs
let seccionActiva = 'carrito';

document.addEventListener('DOMContentLoaded', async function() {
  const perfilContenido = document.getElementById('perfil-contenido');
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    perfilContenido.innerHTML = `
      <div class="no-auth-message">
        <h2>Acceso Restringido</h2>
        <p>Debes iniciar sesión para acceder a tu perfil.</p>
        <button id="goLogin" class="btn">Ir a Iniciar Sesión</button>
      </div>
    `;
    document.getElementById('goLogin').addEventListener('click', () => {
      document.getElementById('showLoginButton')?.click();
    });
    return;
  }

  // Obtener datos del usuario autenticado
  let usuario = null;
  try {
    usuario = await api.getCurrentUser();
  } catch (err) {
    console.error('Error obteniendo usuario:', err);
    perfilContenido.innerHTML = '<p>Error al cargar tu perfil. Por favor intenta nuevamente.</p>';
    return;
  }

  // Iniciales para avatar
  const iniciales = usuario.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  // Renderizar estructura principal
  perfilContenido.innerHTML = `
    <div class="perfil-container">
      <div class="perfil-sidebar">
        <div class="perfil-avatar">
          <div class="avatar">${iniciales}</div>
          <h3>${usuario.name}</h3>
          <p>${usuario.email}</p>
          <p>Miembro desde: ${new Date(usuario.created_at).toLocaleDateString('es-CO')}</p>
        </div>
        
        <ul class="perfil-nav">
          <li><a href="#" class="nav-link" data-seccion="informacion">Información Personal</a></li>
          <li><a href="#" class="nav-link" data-seccion="direcciones">Direcciones</a></li>
          <li><a href="#" class="nav-link" data-seccion="pedidos">Mis Pedidos</a></li>
          <li><a href="#" class="nav-link" data-seccion="carrito">Carrito de Compras</a></li>
          <li><a href="#" class="nav-link" data-seccion="seguridad">Seguridad</a></li>
        </ul>
      </div>
      
      <div class="perfil-content">
        <div id="informacion" class="perfil-seccion" style="display: none;">
          <h2 class="perfil-titulo">Información Personal</h2>
          <form id="form-info-personal">
            <div class="form-group">
              <label>Nombre Completo</label>
              <input type="text" id="nombre" value="${usuario.name}" required>
            </div>
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input type="email" id="email" value="${usuario.email}" disabled>
              <small>El correo no se puede cambiar</small>
            </div>
            <button type="submit" class="btn">Guardar Cambios</button>
          </form>
        </div>

        <div id="direcciones" class="perfil-seccion" style="display: none;">
          <h2 class="perfil-titulo">Mis Direcciones</h2>
          <div id="lista-direcciones"></div>
          <button id="btn-nueva-direccion" class="btn">Agregar Nueva Dirección</button>
          <div id="form-nueva-direccion" style="display: none;">
            <h3>Nueva Dirección</h3>
            <form id="form-direccion">
              <div class="form-group">
                <label>Calle</label>
                <input type="text" name="street" required>
              </div>
              <div class="form-group">
                <label>Ciudad</label>
                <input type="text" name="city" required>
              </div>
              <div class="form-group">
                <label>Código Postal</label>
                <input type="text" name="zip" required>
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input type="tel" name="phone" required>
              </div>
              <button type="submit" class="btn">Guardar Dirección</button>
              <button type="button" id="btn-cancelar-dir" class="btn btn-secondary">Cancelar</button>
            </form>
          </div>
        </div>

        <div id="pedidos" class="perfil-seccion" style="display: none;">
          <h2 class="perfil-titulo">Mis Pedidos</h2>
          <div id="lista-pedidos"></div>
        </div>

        <div id="carrito" class="perfil-seccion" style="display: none;">
          <h2 class="perfil-titulo">Carrito de Compras</h2>
          <div id="lista-carrito"></div>
          <div id="resumen-carrito" style="display: none;">
            <h3>Resumen</h3>
            <p>Total: <strong id="total-carrito">$0</strong></p>
            <button id="btn-finalizar-compra" class="btn">Finalizar Compra</button>
          </div>
        </div>

        <div id="seguridad" class="perfil-seccion" style="display: none;">
          <h2 class="perfil-titulo">Cambiar Contraseña</h2>
          <form id="form-cambiar-password">
            <div class="form-group">
              <label>Contraseña Actual</label>
              <input type="password" id="old_password" required>
            </div>
            <div class="form-group">
              <label>Nueva Contraseña</label>
              <input type="password" id="new_password" required>
            </div>
            <div class="form-group">
              <label>Confirmar Contraseña</label>
              <input type="password" id="confirm_password" required>
            </div>
            <button type="submit" class="btn">Cambiar Contraseña</button>
          </form>
          <hr style="margin: 2rem 0;">
          <h3>Peligro</h3>
          <button id="btn-eliminar-cuenta" class="btn btn-danger">Eliminar Mi Cuenta</button>
        </div>
      </div>
    </div>
  `;

  // Mostrar sección inicial desde URL
  if (window.location.hash) {
    seccionActiva = window.location.hash.substring(1);
  }
  mostrarSeccion(seccionActiva);

  // Event listeners para navegación
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      seccionActiva = e.target.getAttribute('data-seccion');
      mostrarSeccion(seccionActiva);
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // Función para mostrar sección
  function mostrarSeccion(seccion) {
    document.querySelectorAll('.perfil-seccion').forEach(s => s.style.display = 'none');
    const elemento = document.getElementById(seccion);
    if (elemento) elemento.style.display = 'block';
    
    // Actualizar enlace activo
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-link[data-seccion="${seccion}"]`)?.classList.add('active');
    
    // Cargar datos específicos de la sección
    if (seccion === 'pedidos') cargarPedidos();
    if (seccion === 'carrito') cargarCarrito();
    if (seccion === 'direcciones') cargarDirecciones();
  }

  // Cargar y mostrar pedidos
  async function cargarPedidos() {
    const lista = document.getElementById('lista-pedidos');
    try {
      const pedidos = await api.getOrders();
      if (pedidos.length === 0) {
        lista.innerHTML = '<p>No hay pedidos aún.</p>';
        return;
      }
      
      lista.innerHTML = pedidos.map(pedido => `
        <div class="pedido-item">
          <h4>Pedido #${pedido.id}</h4>
          <p>Estado: <strong>${pedido.estado}</strong></p>
          <p>Total: <strong>$${pedido.total?.toLocaleString('es-CO')}</strong></p>
          <p>Fecha: ${new Date(pedido.created_at).toLocaleDateString('es-CO')}</p>
          <a href="#" class="link-details" data-pedido="${pedido.id}">Ver Detalles</a>
        </div>
      `).join('');
    } catch (err) {
      lista.innerHTML = '<p>Error al cargar pedidos.</p>';
    }
  }

  // Cargar y mostrar carrito
  async function cargarCarrito() {
    const lista = document.getElementById('lista-carrito');
    const resumen = document.getElementById('resumen-carrito');
    try {
      const datos = await api.getCart();
      const { items, total } = datos;
      
      if (!items || items.length === 0) {
        lista.innerHTML = '<p>Tu carrito está vacío.</p>';
        resumen.style.display = 'none';
        return;
      }

      lista.innerHTML = `
        <table class="carrito-tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>$${item.price.toLocaleString('es-CO')}</td>
                <td>
                  <input type="number" min="1" value="${item.quantity}" 
                    class="qty-input" data-item="${item.id}">
                </td>
                <td>$${item.subtotal.toLocaleString('es-CO')}</td>
                <td>
                  <button class="btn-remove" data-item="${item.id}">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      document.getElementById('total-carrito').textContent = `$${total.toLocaleString('es-CO')}`;
      resumen.style.display = 'block';

      // Event listeners para carrito
      document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', async (e) => {
          const itemId = e.target.getAttribute('data-item');
          const qty = parseInt(e.target.value);
          if (qty > 0) {
            await api.updateCartItem(itemId, qty);
            cargarCarrito();
          }
        });
      });

      document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const itemId = e.target.getAttribute('data-item');
          await api.removeFromCart(itemId);
          cargarCarrito();
        });
      });
    } catch (err) {
      lista.innerHTML = '<p>Error al cargar el carrito.</p>';
    }
  }

  // Cargar y mostrar direcciones
  async function cargarDirecciones() {
    const lista = document.getElementById('lista-direcciones');
    try {
      const direcciones = await api.getAddresses();
      if (direcciones.length === 0) {
        lista.innerHTML = '<p>No hay direcciones guardadas.</p>';
        return;
      }

      lista.innerHTML = direcciones.map(dir => `
        <div class="direccion-item">
          <p><strong>${dir.street}</strong></p>
          <p>${dir.city}, ${dir.zip}</p>
          <p>Teléfono: ${dir.phone}</p>
          <button class="btn-delete-dir" data-dir="${dir.id}">Eliminar</button>
        </div>
      `).join('');

      document.querySelectorAll('.btn-delete-dir').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const dirId = e.target.getAttribute('data-dir');
          if (confirm('¿Eliminar esta dirección?')) {
            await api.deleteAddress(dirId);
            cargarDirecciones();
          }
        });
      });
    } catch (err) {
      lista.innerHTML = '<p>Error al cargar direcciones.</p>';
    }
  }

  // Eventos de formularios
  document.getElementById('form-info-personal').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    try {
      await api.updateProfile({ name: nombre });
      alert('Perfil actualizado correctamente');
    } catch (err) {
      alert('Error al actualizar perfil');
    }
  });

  document.getElementById('form-cambiar-password').addEventListener('submit', async (e) => {
    e.preventDefault();
    const oldPwd = document.getElementById('old_password').value;
    const newPwd = document.getElementById('new_password').value;
    const confirmPwd = document.getElementById('confirm_password').value;
    
    if (newPwd !== confirmPwd) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    try {
      await api.changePassword(oldPwd, newPwd);
      alert('Contraseña cambiada correctamente');
      document.getElementById('form-cambiar-password').reset();
    } catch (err) {
      alert('Error: ' + (err.message || 'No se pudo cambiar la contraseña'));
    }
  });

  document.getElementById('btn-eliminar-cuenta').addEventListener('click', async () => {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      try {
        await api.deleteAccount();
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        alert('Cuenta eliminada. Redirigiendo...');
        window.location.href = 'index.html';
      } catch (err) {
        alert('Error al eliminar cuenta');
      }
    }
  });

  // Manejo de nueva dirección
  document.getElementById('btn-nueva-direccion').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('form-nueva-direccion').style.display = 'block';
  });

  document.getElementById('btn-cancelar-dir').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('form-nueva-direccion').style.display = 'none';
  });

  document.getElementById('form-direccion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.addAddress({
        street: formData.get('street'),
        city: formData.get('city'),
        zip: formData.get('zip'),
        phone: formData.get('phone')
      });
      alert('Dirección agregada correctamente');
      document.getElementById('form-nueva-direccion').style.display = 'none';
      document.getElementById('form-direccion').reset();
      cargarDirecciones();
    } catch (err) {
      alert('Error al agregar dirección');
    }
  });

  // Finalizar compra
  document.getElementById('btn-finalizar-compra').addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
});
