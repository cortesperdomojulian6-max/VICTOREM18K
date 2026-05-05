// Checkout - Refactorizado para usar APIs
document.addEventListener('DOMContentLoaded', async function() {
  const resumenPedido = document.getElementById('resumen-pedido');
  const totalPedido = document.getElementById('total-pedido');
  const metodoPagoOpciones = document.querySelectorAll('.metodo-pago-opcion');
  const btnPagar = document.getElementById('btn-pagar');
  
  // Elementos del formulario
  const inputNombre = document.getElementById('nombre');
  const inputApellido = document.getElementById('apellido');
  const inputDireccion = document.getElementById('direccion');
  const inputCiudad = document.getElementById('ciudad');
  const inputDepartamento = document.getElementById('departamento');
  const inputTelefono = document.getElementById('telefono');

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

  // Si hay direcciones guardadas, llenarlas en el formulario
  if (direcciones.length > 0) {
    const primeraDireccion = direcciones[0];
    inputNombre.value = primeraDireccion.destinatario.split(' ')[0] || '';
    inputApellido.value = primeraDireccion.destinatario.split(' ').slice(1).join(' ') || '';
    inputDireccion.value = primeraDireccion.direccion;
    inputCiudad.value = primeraDireccion.ciudad;
    inputDepartamento.value = primeraDireccion.departamento;
    inputTelefono.value = primeraDireccion.telefono;
    
    // Guardar el ID de la dirección seleccionada
    document.direccionSeleccionada = { id: primeraDireccion.id };
  }

  // Evento para procesar pago
  if (btnPagar) {
    btnPagar.addEventListener('click', procesarPago);
  }

  async function procesarPago() {
    try {
      let addressId = document.direccionSeleccionada?.id;
      
      // Si no hay dirección seleccionada, crear una nueva
      if (!addressId) {
        const nuevaDireccion = await api.addAddress({
          destinatario: `${inputNombre.value} ${inputApellido.value}`,
          direccion: inputDireccion.value,
          ciudad: inputCiudad.value,
          departamento: inputDepartamento.value,
          telefono: inputTelefono.value
        });
        addressId = nuevaDireccion.id;
      }

      // Crear orden
      const orden = await api.createOrder({
        address_id: parseInt(addressId),
        payment_method: metodoPagoSeleccionado
      });

      // Limpiar localStorage
      localStorage.removeItem('pedidoActual');
      localStorage.removeItem('productoParaComprar');

      // Mostrar confirmación
      alert(`¡Compra confirmada! Tu pedido #${orden.numero_pedido} ha sido creado.`);
      window.location.href = 'miperfil.html';

    } catch (err) {
      alert('Error al procesar la compra: ' + err.message);
      console.error('Error:', err);
    }
  }

  // Manejo de método de pago
  let metodoPagoSeleccionado = 'transferencia';
  metodoPagoOpciones.forEach(opcion => {
    opcion.addEventListener('click', function() {
      metodoPagoOpciones.forEach(o => o.classList.remove('seleccionado'));
      this.classList.add('seleccionado');
      metodoPagoSeleccionado = this.getAttribute('data-metodo');
    });
  });

});