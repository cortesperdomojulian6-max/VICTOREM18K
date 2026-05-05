// Checkout - Refactorizado para usar APIs
document.addEventListener('DOMContentLoaded', async function() {
  const resumenPedido = document.getElementById('resumen-pedido');
  const totalPedido = document.getElementById('total-pedido');
  const formularioCompra = document.getElementById('formulario-compra');
  const metodoPagoOpciones = document.querySelectorAll('.metodo-pago-opcion');
  const btnPagar = document.getElementById('btn-pagar');

  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    resumenPedido.innerHTML = `
      <div class="error-message">
        <h2>Debes iniciar sesión</h2>
        <p>Por favor inicia sesión para continuar con tu compra.</p>
        <button id="btnLogin" class="btn">Iniciar Sesión</button>
      </div>
    `;
    document.getElementById('btnLogin').addEventListener('click', () => {
      document.getElementById('showLoginButton')?.click();
    });
    return;
  }

  // Obtener datos del usuario autenticado
  let usuario = null;
  try {
    usuario = await api.getCurrentUser();
  } catch (err) {
    resumenPedido.innerHTML = '<p>Error al cargar tus datos. Por favor intenta nuevamente.</p>';
    return;
  }

  // Cargar datos del carrito o producto específico
  let cartItems = [];
  let total = 0;
  let productoParaComprar = localStorage.getItem('productoParaComprar');
  
  if (productoParaComprar) {
    // Compra directa de un producto
    const producto = JSON.parse(productoParaComprar);
    cartItems = [{
      name: producto.nombre,
      price: producto.precio,
      quantity: producto.cantidad,
      subtotal: producto.precio * producto.cantidad
    }];
    total = producto.precio * producto.cantidad;
  } else {
    // Compra desde el carrito
    try {
      const datos = await api.getCart();
      cartItems = datos.items || [];
      total = datos.total || 0;
    } catch (err) {
      resumenPedido.innerHTML = '<p>Tu carrito está vacío.</p>';
      return;
    }
  }

  if (cartItems.length === 0) {
    resumenPedido.innerHTML = '<p>No hay productos en tu carrito.</p>';
    totalPedido.textContent = '$0';
    return;
  }

  // Renderizar resumen del carrito
  resumenPedido.innerHTML = cartItems.map(item => `
    <div class="resumen-producto">
      <div class="resumen-info">
        <div class="resumen-nombre">${item.name}</div>
        <div class="resumen-detalles">Cantidad: ${item.cantidad || item.quantity}</div>
      </div>
      <div class="resumen-precio">$${(item.price * (item.cantidad || item.quantity)).toLocaleString('es-CO')}</div>
    </div>
  `).join('');

  totalPedido.textContent = `$${total.toLocaleString('es-CO')}`;

  // Cargar direcciones del usuario
  let direcciones = [];
  try {
    direcciones = await api.getAddresses();
  } catch (err) {
    console.error('Error cargando direcciones:', err);
  }

  // Renderizar sección de dirección
  const direccionSection = document.getElementById('direccion-entrega');
  if (direccionSection && direcciones.length > 0) {
    direccionSection.innerHTML = `
      <h3>Dirección de Entrega</h3>
      <div id="opciones-direccion">
        ${direcciones.map(dir => `
          <label class="direccion-opcion">
            <input type="radio" name="address_id" value="${dir.id}" ${direcciones.indexOf(dir) === 0 ? 'checked' : ''}>
            <div class="direccion-texto">
              <strong>${dir.destinatario}</strong><br>
              ${dir.direccion}<br>
              ${dir.ciudad}, ${dir.departamento}<br>
              Teléfono: ${dir.telefono}
            </div>
          </label>
        `).join('')}
      </div>
      <a href="#" id="nueva-direccion-link">+ Usar nueva dirección</a>
      <div id="nueva-direccion-form" style="display:none; margin-top:1rem;">
        <h4>Nueva Dirección</h4>
        <form id="form-nueva-dir">
          <input type="text" name="destinatario" placeholder="Destinatario" required>
          <input type="text" name="direccion" placeholder="Dirección" required>
          <input type="text" name="ciudad" placeholder="Ciudad" required>
          <input type="text" name="departamento" placeholder="Departamento" required>
          <input type="tel" name="telefono" placeholder="Teléfono" required>
          <button type="submit" class="btn">Guardar y Usar</button>
        </form>
      </div>
    `;

    // Event listeners para nueva dirección
    document.getElementById('nueva-direccion-link').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('nueva-direccion-form').style.display = 
        document.getElementById('nueva-direccion-form').style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('form-nueva-dir').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      try {
        const nuevaDir = await api.addAddress({
          destinatario: formData.get('destinatario'),
          direccion: formData.get('direccion'),
          ciudad: formData.get('ciudad'),
          departamento: formData.get('departamento'),
          telefono: formData.get('telefono')
        });
        
        // Marcar como seleccionada
        const radio = document.querySelector(`input[value="${nuevaDir.id}"]`);
        if (radio) radio.checked = true;
        
        document.getElementById('nueva-direccion-form').style.display = 'none';
      } catch (err) {
        alert('Error al guardar dirección');
      }
    });
  }

  // Manejo de método de pago
  let metodoPagoSeleccionado = 'transfer';
  metodoPagoOpciones.forEach(opcion => {
    opcion.addEventListener('click', function() {
      metodoPagoOpciones.forEach(o => o.classList.remove('seleccionado'));
      this.classList.add('seleccionado');
      metodoPagoSeleccionado = this.getAttribute('data-metodo');
    });
  });

  // Evento para procesar pago
  if (btnPagar) {
    btnPagar.addEventListener('click', procesarPago);
  }

  async function procesarPago() {
    const addressIdInput = document.querySelector('input[name="address_id"]:checked');
    if (!addressIdInput) {
      alert('Por favor selecciona una dirección de entrega');
      return;
    }

    const addressId = addressIdInput.value;

    try {
      // Crear orden
      const orden = await api.createOrder({
        address_id: parseInt(addressId),
        payment_method: metodoPagoSeleccionado
      });

      // Limpiar localStorage
      localStorage.removeItem('pedidoActual');
      localStorage.removeItem('productoParaComprar');

      // Mostrar confirmación
      const confirmSection = document.getElementById('confirmacion-compra') || document.createElement('div');
      confirmSection.id = 'confirmacion-compra';
      confirmSection.innerHTML = `
        <div class="confirmacion-exito">
          <h2>¡Compra Confirmada!</h2>
          <p>Tu pedido #${orden.id} ha sido creado correctamente.</p>
          <p>Total: <strong>$${total.toLocaleString('es-CO')}</strong></p>
          <p>Estado: <strong>Pendiente de Pago</strong></p>
          <a href="miperfil.html#pedidos" class="btn">Ver Mis Pedidos</a>
          <a href="catalogo.html" class="btn btn-secondary">Continuar Comprando</a>
        </div>
      `;
      
      if (document.getElementById('confirmacion-compra')) {
        document.getElementById('confirmacion-compra').replaceWith(confirmSection);
      } else {
        document.body.insertBefore(confirmSection, document.body.firstChild);
      }

      // Ocultar formulario
      const formulario = document.querySelector('.formulario-checkout');
      if (formulario) formulario.style.display = 'none';

    } catch (err) {
      alert('Error al procesar la compra: ' + err.message);
      console.error('Error:', err);
    }
  }

  // Asegurarse de que hay al menos una dirección
  if (direcciones.length === 0) {
    const direccionSection = document.getElementById('direccion-entrega');
    if (direccionSection) {
      direccionSection.innerHTML = `
        <h3>Dirección de Entrega</h3>
        <div id="nueva-direccion-form-inicial">
          <h4>Crea una dirección de entrega</h4>
          <form id="form-primera-dir">
            <div class="form-group">
              <input type="text" name="destinatario" placeholder="Destinatario" required>
            </div>
            <div class="form-group">
              <input type="text" name="direccion" placeholder="Dirección" required>
            </div>
            <div class="form-group">
              <input type="text" name="ciudad" placeholder="Ciudad" required>
            </div>
            <div class="form-group">
              <input type="text" name="departamento" placeholder="Departamento" required>
            </div>
            <div class="form-group">
              <input type="tel" name="telefono" placeholder="Teléfono" required>
            </div>
            <button type="submit" class="btn">Usar esta Dirección</button>
          </form>
        </div>
      `;

    document.getElementById('form-primera-dir').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
          const nuevaDir = await api.addAddress({
            destinatario: formData.get('destinatario'),
            direccion: formData.get('direccion'),
            ciudad: formData.get('ciudad'),
            departamento: formData.get('departamento'),
            telefono: formData.get('telefono')
          });
          
          // Recargar direcciones
          window.location.reload();
        } catch (err) {
          alert('Error al guardar dirección');
        }
      });
    }
  }
});