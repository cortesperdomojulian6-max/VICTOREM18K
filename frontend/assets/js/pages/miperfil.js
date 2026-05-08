let seccionActiva = 'carrito';

document.addEventListener('DOMContentLoaded', async function() {
  await loadSharedHeader();
  initAuth();

  const perfilContenido = document.getElementById('perfil-contenido');

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

  let usuario = null;
  try {
    usuario = await fetchCurrentUser();
  } catch (err) {
    perfilContenido.innerHTML = '<p>Error al cargar tu perfil. Por favor intenta nuevamente.</p>';
    return;
  }

  const iniciales = usuario.name.split(' ').map(n => n[0]).join('').toUpperCase();

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
      <div class="perfil-content">...</div>
    </div>
  `;

  if (window.location.hash) {
    seccionActiva = window.location.hash.substring(1);
  }
  mostrarSeccion(seccionActiva);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      seccionActiva = e.target.getAttribute('data-seccion');
      mostrarSeccion(seccionActiva);
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  function mostrarSeccion(seccion) {
    document.querySelectorAll('.perfil-seccion').forEach(s => s.style.display = 'none');
    const elemento = document.getElementById(seccion);
    if (elemento) elemento.style.display = 'block';

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-link[data-seccion="${seccion}"]`)?.classList.add('active');

    if (seccion === 'pedidos') cargarPedidos();
    if (seccion === 'carrito') cargarCarrito();
    if (seccion === 'direcciones') cargarDirecciones();
  }

  async function cargarPedidos() {
    const lista = document.getElementById('lista-pedidos');
    try {
      const pedidos = await getOrders();
      if (pedidos.length === 0) {
        lista.innerHTML = '<p>No hay pedidos aún.</p>';
        return;
      }
      lista.innerHTML = pedidos.map(p => `
        <div class="pedido-item">
          <h4>Pedido #${p.id}</h4>
          <p>Estado: <strong>${p.estado}</strong></p>
          <p>Total: <strong>$${p.total?.toLocaleString('es-CO')}</strong></p>
          <p>Fecha: ${new Date(p.fecha).toLocaleDateString('es-CO')}</p>
        </div>
      `).join('');
    } catch {
      lista.innerHTML = '<p>Error al cargar pedidos.</p>';
    }
  }

  async function cargarCarrito() {
    const lista = document.getElementById('lista-carrito');
    const resumen = document.getElementById('resumen-carrito');
    try {
      const datos = await getCart();
      const { items, total } = datos;

      if (!items || items.length === 0) {
        lista.innerHTML = '<p>Tu carrito está vacío.</p>';
        resumen.style.display = 'none';
        return;
      }

      lista.innerHTML = `
        <table class="carrito-tabla">
          <thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th>Acciones</th></tr></thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>$${item.price.toLocaleString('es-CO')}</td>
                <td><input type="number" min="1" value="${item.cantidad}" class="qty-input" data-item="${item.id}"></td>
                <td>$${item.subtotal.toLocaleString('es-CO')}</td>
                <td><button class="btn-remove" data-item="${item.id}">Eliminar</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      document.getElementById('total-carrito').textContent = `$${total.toLocaleString('es-CO')}`;
      resumen.style.display = 'block';

      document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', async (e) => {
          const itemId = e.target.getAttribute('data-item');
          const qty = parseInt(e.target.value);
          if (qty > 0) {
            await updateCartItem(itemId, qty);
            cargarCarrito();
          }
        });
      });

      document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const itemId = e.target.getAttribute('data-item');
          await removeFromCart(itemId);
          cargarCarrito();
        });
      });
    } catch {
      lista.innerHTML = '<p>Error al cargar el carrito.</p>';
    }
  }

  async function cargarDirecciones() {
    const lista = document.getElementById('lista-direcciones');
    try {
      const direcciones = await getAddresses();
      if (direcciones.length === 0) {
        lista.innerHTML = '<p>No hay direcciones guardadas.</p>';
        return;
      }
      lista.innerHTML = direcciones.map(dir => `
        <div class="direccion-item">
          <p><strong>${dir.destinatario}</strong></p>
          <p>${dir.direccion}</p>
          <p>${dir.ciudad}, ${dir.departamento}</p>
          <p>Teléfono: ${dir.telefono}</p>
          <button class="btn-delete-dir" data-dir="${dir.id}">Eliminar</button>
        </div>
      `).join('');

      document.querySelectorAll('.btn-delete-dir').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const dirId = e.target.getAttribute('data-dir');
          if (confirm('¿Eliminar esta dirección?')) {
            await deleteAddress(dirId);
            cargarDirecciones();
          }
        });
      });
    } catch {
      lista.innerHTML = '<p>Error al cargar direcciones.</p>';
    }
  }

  document.getElementById('form-info-personal')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    try {
      await updateProfile({ name: nombre });
      alert('Perfil actualizado correctamente');
    } catch {
      alert('Error al actualizar perfil');
    }
  });

  document.getElementById('form-cambiar-password')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const oldPwd = document.getElementById('old_password').value;
    const newPwd = document.getElementById('new_password').value;
    const confirmPwd = document.getElementById('confirm_password').value;
    if (newPwd !== confirmPwd) {
      alert('Las contraseñas no coinciden');
      return;
    }
    try {
      await changePassword(oldPwd, newPwd);
      alert('Contraseña cambiada correctamente');
      document.getElementById('form-cambiar-password').reset();
    } catch (err) {
      alert('Error: ' + (err.message || 'No se pudo cambiar la contraseña'));
    }
  });

  document.getElementById('btn-eliminar-cuenta')?.addEventListener('click', async () => {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      try {
        await deleteAccount();
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        alert('Cuenta eliminada. Redirigiendo...');
        window.location.href = 'index.html';
      } catch {
        alert('Error al eliminar cuenta');
      }
    }
  });

  document.getElementById('btn-nueva-direccion')?.addEventListener('click', () => {
    document.getElementById('form-nueva-direccion').style.display = 'block';
  });

  document.getElementById('btn-cancelar-dir')?.addEventListener('click', () => {
    document.getElementById('form-nueva-direccion').style.display = 'none';
  });

  document.getElementById('form-direccion')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await addAddress({
        destinatario: formData.get('destinatario'),
        direccion: formData.get('direccion'),
        ciudad: formData.get('ciudad'),
        departamento: formData.get('departamento'),
        telefono: formData.get('telefono')
      });
      alert('Dirección agregada correctamente');
      document.getElementById('form-nueva-direccion').style.display = 'none';
      document.getElementById('form-direccion').reset();
      cargarDirecciones();
    } catch {
      alert('Error al agregar dirección');
    }
  });

  document.getElementById('btn-finalizar-compra')?.addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
});
