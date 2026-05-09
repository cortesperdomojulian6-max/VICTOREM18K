document.addEventListener('DOMContentLoaded', async function() {
  await loadSharedHeader();
  initAuth();

  const resumenPedido = document.getElementById('resumen-pedido');
  const totalPedido = document.getElementById('total-pedido');
  const metodoPagoOpciones = document.querySelectorAll('.metodo-pago-opcion');
  const btnPagar = document.getElementById('btn-pagar');

  const inputNombre = document.getElementById('nombre');
  const inputApellido = document.getElementById('apellido');
  const inputDireccion = document.getElementById('direccion');
  const inputCiudad = document.getElementById('ciudad');
  const inputDepartamento = document.getElementById('departamento');
  const inputTelefono = document.getElementById('telefono');

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

  let usuario = null;
  try {
    usuario = await fetchCurrentUser();
  } catch (err) {
    resumenPedido.innerHTML = '<p>Error al cargar tus datos. Por favor intenta nuevamente.</p>';
    return;
  }

  let cartItems = [];
  let total = 0;
  let productoParaComprar = localStorage.getItem('productoParaComprar');

  if (productoParaComprar) {
    const producto = JSON.parse(productoParaComprar);
    cartItems = [{
      name: producto.nombre,
      price: producto.precio,
      quantity: producto.cantidad,
      subtotal: producto.precio * producto.cantidad
    }];
    total = producto.precio * producto.cantidad;
  } else {
    try {
      const datos = await getCart();
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

  let direcciones = [];
  try {
    direcciones = await getAddresses();
  } catch (err) {
    console.error('Error cargando direcciones:', err);
  }

  if (direcciones.length > 0) {
    const primeraDireccion = direcciones[0];
    inputNombre.value = primeraDireccion.destinatario.split(' ')[0] || '';
    inputApellido.value = primeraDireccion.destinatario.split(' ').slice(1).join(' ') || '';
    inputDireccion.value = primeraDireccion.direccion;
    inputCiudad.value = primeraDireccion.ciudad;
    inputDepartamento.value = primeraDireccion.departamento;
    inputTelefono.value = primeraDireccion.telefono;

    document.direccionSeleccionada = { id: primeraDireccion.id };
  }

  if (btnPagar) {
    btnPagar.addEventListener('click', procesarPago);
  }

  async function procesarPago() {
    try {
      let addressId = document.direccionSeleccionada?.id;

      if (!addressId) {
        const nuevaDireccion = await addAddress({
          destinatario: `${inputNombre.value} ${inputApellido.value}`,
          direccion: inputDireccion.value,
          ciudad: inputCiudad.value,
          departamento: inputDepartamento.value,
          telefono: inputTelefono.value
        });
        addressId = nuevaDireccion.id;
      }

      if (metodoPagoSeleccionado === 'wompi') {
        await procesarPagoWompi(parseInt(addressId), total);
        return;
      }

      const orden = await createOrder({
        address_id: parseInt(addressId),
        payment_method: metodoPagoSeleccionado
      });

      localStorage.removeItem('pedidoActual');
      localStorage.removeItem('productoParaComprar');

      alert(`¡Compra confirmada! Tu pedido #${orden.numero_pedido} ha sido creado.`);
      window.location.href = 'miperfil.html';

    } catch (err) {
      alert('Error al procesar la compra: ' + err.message);
      console.error('Error:', err);
    }
  }

  async function procesarPagoWompi(addressId, monto) {
    try {
      if (!wompiClient.initialized) {
        await wompiClient.init();
      }

      const orden = await createOrder({
        address_id: addressId,
        payment_method: 'wompi',
        keepCart: true
      });

      const reference = orden.numero_pedido;
      const transaction = await wompiClient.createTransaction(
        monto,
        reference,
        usuario.email,
        orden.id
      );

      if (transaction.redirect_url) {
        localStorage.setItem('wompiPendingOrder', JSON.stringify({
          orderId: orden.id,
          reference,
          amount: monto
        }));
        window.location.href = transaction.redirect_url;
        return;
      }

      alert('¡Pago procesado! Por favor revisa tu correo para detalles.');
      localStorage.removeItem('pedidoActual');
      localStorage.removeItem('productoParaComprar');
      window.location.href = 'miperfil.html';

    } catch (err) {
      console.error('Error en Wompi:', err);
      alert('Error procesando pago con Wompi: ' + err.message);
    }
  }

  let metodoPagoSeleccionado = 'transferencia';
  metodoPagoOpciones.forEach(opcion => {
    opcion.addEventListener('click', function() {
      metodoPagoOpciones.forEach(o => o.classList.remove('seleccionado'));
      this.classList.add('seleccionado');
      metodoPagoSeleccionado = this.getAttribute('data-metodo');
    });
  });
});
