let todosLosProductos = [];
let productosFiltrados = [];
let productosContainer = null;
let modal = null;
let modalNombre, modalPrecio, modalImagen, modalDescripcion, modalCaracteristicas;

function renderizarCatalogo(lista) {
    if (!productosContainer) {
        productosContainer = document.getElementById('lista-productos');
        if (!productosContainer) return;
    }

    productosContainer.innerHTML = '';

    if (!lista || lista.length === 0) {
        productosContainer.innerHTML = '<p class="sin-resultados">No se encontraron productos.</p>';
        return;
    }

    lista.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="card-img">
            <div class="card-content">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p class="price">${producto.precio}</p>
                <div class="card-acciones">
                    <button class="btn btn-detalle" data-producto="${producto.id}">Ver Detalles</button>
                    <button class="btn btn-outline btn-agregar-carrito" data-producto="${producto.id}">Agregar al Carrito</button>
                </div>
            </div>
        `;

        productosContainer.appendChild(card);
    });

    document.querySelectorAll('.btn-detalle').forEach(btn => {
        btn.addEventListener('click', function() {
            abrirModal(this.getAttribute('data-producto'));
        });
    });

    document.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = parseInt(this.getAttribute('data-producto'));
            if (!isAuthenticated()) {
                alert('Por favor, inicia sesión para agregar al carrito.');
                return;
            }
            try {
                await addToCart(id, 1);
                alert('Producto agregado al carrito.');
            } catch {
                alert('Error al agregar al carrito.');
            }
        });
    });
}

function aplicarFiltros() {
    const categoria = document.getElementById('categoria')?.value || 'todos';
    const rangoPrecio = document.getElementById('precio')?.value || 'todos';
    const busqueda = (document.getElementById('busqueda')?.value || '').toLowerCase().trim();

    productosFiltrados = todosLosProductos.filter(p => {
        if (categoria !== 'todos' && p.categoria !== categoria) return false;

        if (rangoPrecio !== 'todos') {
            const [min, max] = rangoPrecio.split('-').map(Number);
            if (p.precioNumerico < min || p.precioNumerico > max) return false;
        }

        if (busqueda && !p.nombre.toLowerCase().includes(busqueda)) return false;

        return true;
    });

    aplicarOrden();
}

function aplicarOrden() {
    const orden = document.getElementById('ordenar')?.value || 'popularidad';

    switch (orden) {
        case 'precio-asc':
            productosFiltrados.sort((a, b) => a.precioNumerico - b.precioNumerico);
            break;
        case 'precio-desc':
            productosFiltrados.sort((a, b) => b.precioNumerico - a.precioNumerico);
            break;
        case 'nombre':
            productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        default:
            break;
    }

    renderizarCatalogo(productosFiltrados);
}

function limpiarFiltros() {
    document.getElementById('categoria').value = 'todos';
    document.getElementById('precio').value = 'todos';
    document.getElementById('busqueda').value = '';
    document.getElementById('ordenar').value = 'popularidad';
    productosFiltrados = [...todosLosProductos];
    renderizarCatalogo(productosFiltrados);
}

function abrirModal(id) {
    const producto = todosLosProductos.find(p => p.id == id);
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
  await loadSharedHeader();
  initAuth();

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
    todosLosProductos = productos.map(p => ({
        id: p.id,
        nombre: p.name,
        descripcion: p.description,
        precio: `$${Number(p.price).toLocaleString('es-CO')}`,
        precioNumerico: Number(p.price),
        imagen: (p.image_url ? '/assets/' + p.image_url : '/assets/images/placeholder.jpg'),
        categoria: p.category || 'pulseras',
        caracteristicas: p.features || []
    }));
    productosFiltrados = [...todosLosProductos];
    renderizarCatalogo(productosFiltrados);
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
    window.location.href = `checkout.html?producto=${id}`;
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
      } catch {
        alert('Error al agregar al carrito.');
      }
    }
  });

  document.getElementById('aplicar-filtros')?.addEventListener('click', aplicarFiltros);
  document.getElementById('limpiar-filtros')?.addEventListener('click', limpiarFiltros);
  document.getElementById('ordenar')?.addEventListener('change', aplicarOrden);
  document.getElementById('busqueda')?.addEventListener('input', aplicarFiltros);
});
