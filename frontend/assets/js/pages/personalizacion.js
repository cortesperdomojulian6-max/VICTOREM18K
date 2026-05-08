import { addToCart } from '../services/api.js';
import { isAuthenticated, showLoginModal, initAuth } from '../services/auth.js';
import { loadSharedHeader } from '../components/header-loader.js';

document.addEventListener('DOMContentLoaded', function() {
  loadSharedHeader();
  initAuth();

  const datosPersonalizacion = {
    tipoJoya: null,
    dije: null,
    colorHilo: null,
    cantidadBalines: 4,
    precioBase: 0,
    precioDije: 0,
    precioBalines: 0,
    total: 0
  };

  const precios = {
    pulsera: { base: 80000, balin: 5000 },
    anillo: { base: 60000, balin: 4000 }
  };

  const dijesDisponibles = {
    'van-cleef': { nombre: 'Van Cleef', precio: 15000 },
    'san-benito': { nombre: 'San Benito', precio: 12000 },
    'rolex': { nombre: 'Rolex', precio: 20000 },
    'bolsa-dinero': { nombre: 'Bolsa de Dinero', precio: 10000 },
    'dolar': { nombre: 'Dólar', precio: 10000 },
    'sin-dije': { nombre: 'Sin Dije', precio: 0 }
  };

  function paso(id) { return document.getElementById('paso-' + id); }
  function mostrarPaso(id) {
    document.querySelectorAll('.paso-contenido').forEach(p => p.classList.remove('activo'));
    document.querySelectorAll('.paso').forEach(p => p.classList.remove('activo'));
    const pasoEl = paso(id);
    if (pasoEl) pasoEl.classList.add('activo');
    const indicador = document.querySelector(`.paso[data-paso="${id}"]`);
    if (indicador) indicador.classList.add('activo');
  }

  function actualizarResumen() {
    const d = datosPersonalizacion;
    document.getElementById('resumen-tipo').textContent =
      d.tipoJoya === 'pulsera' ? 'Pulsera' : d.tipoJoya === 'anillo' ? 'Anillo' : '-';
    document.getElementById('resumen-dije').textContent =
      d.dije ? (dijesDisponibles[d.dije]?.nombre || d.dije) : 'Ninguno';
    document.getElementById('resumen-color').textContent =
      d.colorHilo ? d.colorHilo.charAt(0).toUpperCase() + d.colorHilo.slice(1) : '-';
    document.getElementById('resumen-balines').textContent = d.cantidadBalines;
    document.getElementById('resumen-precio-base').textContent = `$${d.precioBase.toLocaleString()}`;
    document.getElementById('resumen-precio-dije').textContent = d.dije
      ? `$${d.precioDije.toLocaleString()}`
      : '$0';
    document.getElementById('resumen-precio-balines').textContent = `$${d.precioBalines.toLocaleString()}`;
    document.getElementById('resumen-total').textContent = `$${d.total.toLocaleString()}`;
  }

  function actualizarPrecio() {
    const tipo = datosPersonalizacion.tipoJoya;
    if (!tipo) return;

    const preciosTipo = precios[tipo];
    datosPersonalizacion.precioBase = preciosTipo.base;
    datosPersonalizacion.precioBalines = datosPersonalizacion.cantidadBalines * preciosTipo.balin;

    datosPersonalizacion.total = datosPersonalizacion.precioBase
      + datosPersonalizacion.precioDije
      + datosPersonalizacion.precioBalines;

    actualizarResumen();
  }

  document.querySelectorAll('.opcion[data-tipo]').forEach(opcion => {
    opcion.addEventListener('click', function() {
      document.querySelectorAll('.opcion[data-tipo]').forEach(o => o.classList.remove('seleccionada'));
      this.classList.add('seleccionada');

      datosPersonalizacion.tipoJoya = this.getAttribute('data-tipo');
      datosPersonalizacion.precioDije = 0;
      datosPersonalizacion.dije = null;
      actualizarPrecio();

      const contenedorDijes = document.getElementById('opciones-dijes');
      contenedorDijes.innerHTML = '';

      Object.entries(dijesDisponibles).forEach(([clave, valor]) => {
        const opcion = document.createElement('div');
        opcion.className = 'opcion';
        opcion.setAttribute('data-dije', clave);

        opcion.innerHTML = `
          <div class="opcion-img">
            <img src="/assets/images/dijes/${clave}.jpg" alt="${valor.nombre}" style="width:40px;height:40px;object-fit:contain" onerror="this.src='/assets/images/logo.png'">
          </div>
          <h4>${valor.nombre}</h4>
          <p>${valor.precio > 0 ? '+ $' + valor.precio.toLocaleString() : 'Incluido'}</p>
        `;

        opcion.addEventListener('click', function() {
          document.querySelectorAll('#opciones-dijes .opcion').forEach(o => o.classList.remove('seleccionada'));
          this.classList.add('seleccionada');

          datosPersonalizacion.dije = clave;
          datosPersonalizacion.precioDije = valor.precio;
          actualizarPrecio();
        });

        contenedorDijes.appendChild(opcion);
      });
    });
  });

  document.querySelectorAll('.opcion[data-color]').forEach(opcion => {
    opcion.addEventListener('click', function() {
      document.querySelectorAll('.opcion[data-color]').forEach(o => o.classList.remove('seleccionada'));
      this.classList.add('seleccionada');
      datosPersonalizacion.colorHilo = this.getAttribute('data-color');
    });
  });

  document.getElementById('disminuir-balines')?.addEventListener('click', function() {
    const input = document.getElementById('cantidad-balines');
    let val = parseInt(input.value) || 4;
    if (val > 4) {
      val -= 2;
      input.value = val;
      datosPersonalizacion.cantidadBalines = val;
      actualizarPrecio();
    }
  });

  document.getElementById('aumentar-balines')?.addEventListener('click', function() {
    const input = document.getElementById('cantidad-balines');
    let val = parseInt(input.value) || 4;
    if (val < 10) {
      val += 2;
      input.value = val;
      datosPersonalizacion.cantidadBalines = val;
      actualizarPrecio();
    }
  });

  document.getElementById('cantidad-balines')?.addEventListener('input', function() {
    datosPersonalizacion.cantidadBalines = parseInt(this.value) || 4;
    actualizarPrecio();
  });

  // Step navigation
  document.getElementById('siguiente-paso-1')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (!datosPersonalizacion.tipoJoya) {
      document.getElementById('error-paso-1').style.display = 'block';
      return;
    }
    document.getElementById('error-paso-1').style.display = 'none';
    mostrarPaso(2);
  });

  document.getElementById('siguiente-paso-2')?.addEventListener('click', function(e) {
    e.preventDefault();
    mostrarPaso(3);
  });

  document.getElementById('siguiente-paso-3')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (!datosPersonalizacion.colorHilo) {
      document.getElementById('error-paso-3').style.display = 'block';
      return;
    }
    document.getElementById('error-paso-3').style.display = 'none';
    mostrarPaso(4);
  });

  document.getElementById('siguiente-paso-4')?.addEventListener('click', function(e) {
    e.preventDefault();
    const val = datosPersonalizacion.cantidadBalines;
    if (val < 4 || val > 10 || val % 2 !== 0) {
      document.getElementById('error-paso-4').style.display = 'block';
      return;
    }
    document.getElementById('error-paso-4').style.display = 'none';
    actualizarResumen();
    mostrarPaso(5);
  });

  document.getElementById('anterior-paso-2')?.addEventListener('click', function(e) { e.preventDefault(); mostrarPaso(1); });
  document.getElementById('anterior-paso-3')?.addEventListener('click', function(e) { e.preventDefault(); mostrarPaso(2); });
  document.getElementById('anterior-paso-4')?.addEventListener('click', function(e) { e.preventDefault(); mostrarPaso(3); });
  document.getElementById('anterior-paso-5')?.addEventListener('click', function(e) { e.preventDefault(); mostrarPaso(4); });

  function guardarProductoParaCompra() {
    const tipo = datosPersonalizacion.tipoJoya;
    const item = {
      id: 'personalizado-' + Date.now(),
      nombre: tipo === 'pulsera' ? 'Pulsera Personalizada' : 'Anillo Personalizado',
      precio: datosPersonalizacion.total,
      imagen: tipo === 'pulsera' ? '/assets/images/pulsera icono.png' : '/assets/images/anillo icono.png',
      personalizacion: {
        tipo: datosPersonalizacion.tipoJoya,
        dije: datosPersonalizacion.dije,
        color: datosPersonalizacion.colorHilo,
        balines: datosPersonalizacion.cantidadBalines
      }
    };
    localStorage.setItem('productoParaComprar', JSON.stringify(item));
  }

  document.getElementById('agregar-al-carrito')?.addEventListener('click', async function() {
    if (!isAuthenticated()) {
      showLoginModal();
      return;
    }
    guardarProductoParaCompra();
    alert('¡Producto personalizado agregado al carrito!');
  });

  document.getElementById('proceder-pago-personalizado')?.addEventListener('click', function() {
    if (!isAuthenticated()) {
      showLoginModal();
      return;
    }
    guardarProductoParaCompra();
    window.location.href = 'checkout.html';
  });
});
