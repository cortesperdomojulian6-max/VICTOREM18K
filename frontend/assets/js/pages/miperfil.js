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
  const avatarImg = usuario.avatar_url || '';

  perfilContenido.innerHTML = `
    <div class="perfil-container">
      <div class="perfil-sidebar">
        <div class="perfil-avatar">
          ${avatarImg ? `<img src="${avatarImg}" alt="Avatar" class="avatar-img">` : `<div class="avatar">${iniciales}</div>`}
          <button class="btn-change-avatar" id="btn-change-avatar">Cambiar foto</button>
          <input type="file" id="avatar-input" accept="image/*" style="display:none">
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
        <div id="informacion" class="perfil-seccion" style="display:none;">
          <h3>Información Personal</h3>
          <form id="form-info-personal">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" id="nombre" value="${usuario.name}" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" value="${usuario.email}" disabled style="opacity:0.6;">
            </div>
            <button type="submit" class="btn">Guardar Cambios</button>
          </form>
        </div>

        <div id="direcciones" class="perfil-seccion" style="display:none;">
          <h3>Mis Direcciones</h3>
          <div id="lista-direcciones"></div>
          <button id="btn-nueva-direccion" class="btn btn-outline" style="margin-top:16px;">+ Agregar Dirección</button>
          <div id="form-nueva-direccion" style="display:none; margin-top:16px;">
            <form id="form-direccion">
              <div class="form-group">
                <label for="destinatario">Destinatario</label>
                <input type="text" name="destinatario" required>
              </div>
              <div class="form-group">
                <label for="dir-direccion">Dirección</label>
                <input type="text" name="direccion" required>
              </div>
              <div class="form-group">
                <label for="dir-ciudad">Ciudad</label>
                <input type="text" name="ciudad" required>
              </div>
              <div class="form-group">
                <label for="dir-departamento">Departamento</label>
                <input type="text" name="departamento" required>
              </div>
              <div class="form-group">
                <label for="dir-telefono">Teléfono</label>
                <input type="tel" name="telefono" required>
              </div>
              <button type="submit" class="btn">Guardar Dirección</button>
              <button type="button" id="btn-cancelar-dir" class="btn btn-outline">Cancelar</button>
            </form>
          </div>
        </div>

        <div id="pedidos" class="perfil-seccion" style="display:none;">
          <h3>Mis Pedidos</h3>
          <div id="lista-pedidos"></div>
        </div>

        <div id="carrito" class="perfil-seccion" style="display:none;">
          <h3>Carrito de Compras</h3>
          <div id="lista-carrito"></div>
          <div id="resumen-carrito" style="display:none; margin-top:20px;">
            <p style="font-size:18px;">Total: <strong id="total-carrito">$0</strong></p>
            <button id="btn-finalizar-compra" class="btn" style="margin-top:12px;">Finalizar Compra</button>
          </div>
        </div>

        <div id="seguridad" class="perfil-seccion" style="display:none;">
          <h3>Seguridad</h3>
          <form id="form-cambiar-password">
            <div class="form-group">
              <label for="old_password">Contraseña Actual</label>
              <input type="password" id="old_password" required>
            </div>
            <div class="form-group">
              <label for="new_password">Nueva Contraseña</label>
              <input type="password" id="new_password" required minlength="6">
            </div>
            <div class="form-group">
              <label for="confirm_password">Confirmar Nueva Contraseña</label>
              <input type="password" id="confirm_password" required>
            </div>
            <button type="submit" class="btn">Cambiar Contraseña</button>
          </form>
          <div style="margin-top:30px; padding-top:20px; border-top:1px solid #eee;">
            <button id="btn-eliminar-cuenta" class="btn btn-danger">Eliminar mi Cuenta</button>
          </div>
        </div>
      </div>
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
        <div class="cart-table-wrap">
          <table class="cart-table">
            <thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>$${Number(item.price).toLocaleString('es-CO')}</td>
                  <td>
                    <div class="cart-qty">
                      <button class="qty-minus" data-item="${item.id}">−</button>
                      <input type="number" min="1" value="${item.cantidad}" class="qty-input" data-item="${item.id}">
                      <button class="qty-plus" data-item="${item.id}">+</button>
                    </div>
                  </td>
                  <td>$${Number(item.subtotal).toLocaleString('es-CO')}</td>
                  <td><button class="cart-remove" data-item="${item.id}">✕</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
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

      document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const itemId = e.target.getAttribute('data-item');
          const input = document.querySelector(`.qty-input[data-item="${itemId}"]`);
          if (input) {
            const val = parseInt(input.value) || 1;
            if (val > 1) {
              input.value = val - 1;
              await updateCartItem(itemId, val - 1);
              cargarCarrito();
            }
          }
        });
      });

      document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const itemId = e.target.getAttribute('data-item');
          const input = document.querySelector(`.qty-input[data-item="${itemId}"]`);
          if (input) {
            const val = parseInt(input.value) || 1;
            input.value = val + 1;
            await updateCartItem(itemId, val + 1);
            cargarCarrito();
          }
        });
      });

      document.querySelectorAll('.cart-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const itemId = e.target.getAttribute('data-item');
          if (confirm('¿Eliminar este producto del carrito?')) {
            await removeFromCart(itemId);
            cargarCarrito();
          }
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

  document.getElementById('btn-change-avatar')?.addEventListener('click', () => {
    document.getElementById('avatar-input')?.click();
  });

  document.getElementById('avatar-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no puede superar 2MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        await updateProfile({ name: usuario.name, avatar_url: base64 });
        alert('Foto de perfil actualizada');
        window.location.reload();
      };
      reader.readAsDataURL(file);
    } catch {
      alert('Error al subir la foto');
    }
  });
});
