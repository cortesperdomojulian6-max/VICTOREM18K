import { getProducts, addToCart } from '../services/api.js';
import { isAuthenticated } from '../services/auth.js';
import { loadSharedHeader } from '../components/header-loader.js';

let productosData = {};
let productosContainer = null;
let modal = null;
let modalNombre, modalPrecio, modalImagen, modalDescripcion, modalCaracteristicas;

function renderizarCatalogo() {
    if (!productosContainer) {
        productosContainer = document.getElementById('lista-productos');
        if (!productosContainer) return;
    }

    productosContainer.innerHTML = '';

    Object.entries(productosData).forEach(([id, producto]) => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="card-img">
            <div class="card-content">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p class="price">${producto.precio}</p>
                <button class="btn btn-detalle" data-producto="${id}">Ver Detalles</button>
            </div>
        `;

        productosContainer.appendChild(card);
    });

    document.querySelectorAll('.btn-detalle').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-producto');
            abrirModal(id);
        });
    });
}

function abrirModal(id) {
    const producto = productosData[id];
    if (!producto) return;

    modalNombre.textContent = producto.nombre;
    modalPrecio.textContent = producto.precio;
    modalImagen.src = producto.imagen;
    modalImagen.alt = producto.nombre;
    modalDescripcion.textContent = producto.descripcion;

    modalCaracteristicas.innerHTML = (producto.caracteristicas || [])
        .map(c => `<li>${c}</li>`).join('');

    modal.dataset.productoId = id;
    modal.style.display = 'flex';
}

function cerrarModal() {
    modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async function() {
  loadSharedHeader();

  productosContainer = document.getElementById('lista-productos');
  modal = document.getElementById('modal-producto');
  modalNombre = document.getElementById('modal-nombre');
  modalPrecio = document.getElementById('modal-precio');
  modalImagen = document.getElementById('modal-imagen');
  modalDescripcion = document.getElementById('modal-descripcion');
  modalCaracteristicas = document.getElementById('modal-caracteristicas');

  if (!productosContainer) return;

  try {
    const productos = await getProducts();
    productosData = {};
    productos.forEach(p => {
      productosData[p.id] = {
        nombre: p.name,
        descripcion: p.description,
        precio: `$${p.price.toLocaleString('es-CO')}`,
        imagen: p.image_url || '/assets/images/placeholder.jpg',
        caracteristicas: []
      };
    });
    renderizarCatalogo();
  } catch (err) {
    productosContainer.innerHTML = '<p>Error al cargar productos.</p>';
  }

  document.getElementById('cerrar-modal')?.addEventListener('click', cerrarModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  document.getElementById('comprar-ahora')?.addEventListener('click', function() {
    if (!isAuthenticated()) {
      alert('Por favor, inicia sesión para comprar.');
      return;
    }
    const id = modal.dataset.productoId;
    alert(`Redirigiendo a compra del producto ${id}...`);
  });

  document.getElementById('agregar-carrito-modal')?.addEventListener('click', async function() {
    if (!isAuthenticated()) {
      alert('Por favor, inicia sesión para agregar al carrito.');
      return;
    }
    const id = modal.dataset.productoId;
    if (id) {
      try {
        await addToCart(parseInt(id), 1);
        alert('Producto agregado al carrito.');
      } catch (err) {
        alert('Error al agregar al carrito.');
      }
    }
  });
});
