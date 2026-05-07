import { addToCart } from '../services/api.js';
import { isAuthenticated, showLoginModal } from '../services/auth.js';
import { loadSharedHeader } from '../components/header-loader.js';

document.addEventListener('DOMContentLoaded', function() {
  loadSharedHeader();

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

  function actualizarPrecio() {
    const tipo = datosPersonalizacion.tipoJoya;
    if (!tipo) return;

    const preciosTipo = precios[tipo];
    datosPersonalizacion.precioBase = preciosTipo.base;
    datosPersonalizacion.precioBalines = datosPersonalizacion.cantidadBalines * preciosTipo.balin;

    datosPersonalizacion.total = datosPersonalizacion.precioBase
      + datosPersonalizacion.precioDije
      + datosPersonalizacion.precioBalines;

    document.getElementById('precio-base').textContent = `$${datosPersonalizacion.precioBase.toLocaleString()}`;
    document.getElementById('precio-dije').textContent = datosPersonalizacion.dije
      ? `$${datosPersonalizacion.precioDije.toLocaleString()}`
      : 'No seleccionado';
    document.getElementById('precio-balines').textContent = `$${datosPersonalizacion.precioBalines.toLocaleString()}`;
    document.getElementById('precio-total').textContent = `$${datosPersonalizacion.total.toLocaleString()}`;
  }

  document.querySelectorAll('.opcion-joya').forEach(opcion => {
    opcion.addEventListener('click', function() {
      document.querySelectorAll('.opcion-joya').forEach(o => o.classList.remove('seleccionada'));
      this.classList.add('seleccionada');

      datosPersonalizacion.tipoJoya = this.getAttribute('data-tipo');
      datosPersonalizacion.precioDije = 0;
      datosPersonalizacion.dije = null;

      document.getElementById('paso-2').style.display = 'block';
      document.getElementById('paso-3').style.display = 'none';

      const contenedorDijes = document.getElementById('dijes-container');
      contenedorDijes.innerHTML = '';

      Object.entries(dijesDisponibles).forEach(([clave, valor]) => {
        const opcion = document.createElement('div');
        opcion.className = 'opcion';
        opcion.setAttribute('data-dije', clave);

        opcion.innerHTML = `
          <img src="/assets/images/dijes/${clave}.jpg" alt="${valor.nombre}" class="opcion-img" onerror="this.src='/assets/images/logo.png'">
          <h4>${valor.nombre}</h4>
          <p>${valor.precio > 0 ? '+ $' + valor.precio.toLocaleString() : 'Incluido'}</p>
        `;

        opcion.addEventListener('click', function() {
          document.querySelectorAll('#paso-2 .opcion').forEach(o => o.classList.remove('seleccionada'));
          this.classList.add('seleccionada');

          datosPersonalizacion.dije = clave;
          datosPersonalizacion.precioDije = valor.precio;
          actualizarPrecio();

          document.getElementById('paso-3').style.display = 'block';
        });

        contenedorDijes.appendChild(opcion);
      });

      document.getElementById('info-balines').style.display = 'block';
      actualizarPrecio();
    });
  });

  document.getElementById('cantidad-balines')?.addEventListener('input', function() {
    datosPersonalizacion.cantidadBalines = parseInt(this.value) || 0;
    document.getElementById('cantidad-balines-valor').textContent = this.value;
    actualizarPrecio();
  });

  document.querySelectorAll('.opcion-color').forEach(opcion => {
    opcion.addEventListener('click', function() {
      document.querySelectorAll('.opcion-color').forEach(o => o.classList.remove('seleccionada'));
      this.classList.add('seleccionada');
      datosPersonalizacion.colorHilo = this.getAttribute('data-color');
    });
  });

  document.getElementById('agregar-carrito-perso')?.addEventListener('click', async function() {
    if (!datosPersonalizacion.tipoJoya) {
      alert('Por favor selecciona un tipo de joya.');
      return;
    }

    if (!isAuthenticated()) {
      showLoginModal();
      return;
    }

    const tipo = datosPersonalizacion.tipoJoya;
    const imagen = tipo === 'pulsera' ? '/assets/images/pulsera icono.png' : '/assets/images/anillo icono.png';
    const nombre = tipo === 'pulsera' ? 'Pulsera Personalizada' : 'Anillo Personalizado';

    const item = {
      id: 'personalizado-' + Date.now(),
      nombre: nombre,
      precio: datosPersonalizacion.total,
      imagen: imagen,
      personalizacion: {
        tipo: datosPersonalizacion.tipoJoya,
        dije: datosPersonalizacion.dije,
        color: datosPersonalizacion.colorHilo,
        balines: datosPersonalizacion.cantidadBalines
      }
    };

    localStorage.setItem('productoParaComprar', JSON.stringify(item));
    alert('¡Producto personalizado listo!');
    window.location.href = 'checkout.html';
  });
});
