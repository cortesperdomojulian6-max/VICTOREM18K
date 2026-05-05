// Catálogo - Refactorizado para usar APIs
let productosData = {};
let productosContainer = null;
let modal = null;
let modalNombre, modalPrecio, modalImagen, modalDescripcion, modalCaracteristicas;

// Función para renderizar el catálogo
function renderizarCatalogo() {
    if (!productosContainer) {
        productosContainer = document.getElementById('lista-productos');
        if (!productosContainer) return;
    }
    
    // Limpiar contenedor
    productosContainer.innerHTML = '';
    
    // Crear tarjetas de producto
    Object.entries(productosData).forEach(([id, producto]) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-producto', id);
        card.setAttribute('data-categoria', 'general');
        card.setAttribute('data-precio', producto.precioNumerico);
        
        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="precio">${producto.precio}</p>
            <p class="descripcion">${producto.descripcion.substring(0, 100)}...</p>
            <button class="btn-detalle" data-producto="${id}">Ver Detalles</button>
            <button class="btn-agregar-carrito" data-producto="${id}">Agregar al Carrito</button>
        `;
        
        productosContainer.appendChild(card);
    });
    
    // Re-aplicar event listeners
    aplicarEventListeners();
}

// Función para aplicar event listeners a los productos
function aplicarEventListeners() {
    // Inicializar elementos del modal si no están ya
    if (!modal) {
        modal = document.getElementById('modal-producto');
        modalNombre = document.getElementById('modal-nombre');
        modalPrecio = document.getElementById('modal-precio');
        modalImagen = document.getElementById('modal-imagen');
        modalDescripcion = document.getElementById('modal-descripcion');
        modalCaracteristicas = document.getElementById('modal-caracteristicas');
    }

    // Event listeners para ver detalles
    document.querySelectorAll('.btn-detalle').forEach(boton => {
        boton.addEventListener('click', function () {
            const productoId = this.getAttribute('data-producto');
            const producto = productosData[productoId];

            if (producto && modal && modalNombre) {
                modalNombre.textContent = producto.nombre;
                modalPrecio.textContent = producto.precio;
                modalImagen.src = producto.imagen;
                modalImagen.alt = producto.nombre;
                modalDescripcion.textContent = producto.descripcion;

                // Limpiar características anteriores
                modalCaracteristicas.innerHTML = '';

                // Agregar características
                (producto.caracteristicas || []).forEach(caracteristica => {
                    const li = document.createElement('li');
                    li.textContent = caracteristica;
                    modalCaracteristicas.appendChild(li);
                });

                modal.style.display = 'block';
                
                // Marcar como activo
                document.querySelectorAll('.btn-detalle').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Event listeners para agregar al carrito (desde tarjeta)
    document.querySelectorAll('.btn-agregar-carrito').forEach(boton => {
        boton.addEventListener('click', function () {
            const productoId = this.getAttribute('data-producto');
            const producto = productosData[productoId];

            // Verificar autenticación
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Por favor, inicia sesión para agregar productos al carrito.');
                const loginBtn = document.getElementById('showLoginButton');
                if (loginBtn) loginBtn.click();
                return;
            }

            agregarAlCarritoAPI(productoId, producto, 1);
        });
    });

    // Botón de agregar al carrito desde el modal
    const btnAgregarModal = document.getElementById('agregar-carrito-modal');
    if (btnAgregarModal) {
        btnAgregarModal.addEventListener('click', function () {
            const productoId = document.querySelector('.btn-detalle.active')?.getAttribute('data-producto');
            if (productoId) {
                const producto = productosData[productoId];
                const token = localStorage.getItem('token');
                
                if (!token) {
                    alert('Por favor, inicia sesión para agregar productos al carrito.');
                    const loginBtn = document.getElementById('showLoginButton');
                    if (loginBtn) loginBtn.click();
                    return;
                }

                agregarAlCarritoAPI(productoId, producto, 1);
                modal.style.display = 'none';
            }
        });
    }

    // Botón de comprar ahora desde el modal
    const btnComprarAhora = document.getElementById('comprar-ahora');
    if (btnComprarAhora) {
        btnComprarAhora.addEventListener('click', function () {
            const productoId = document.querySelector('.btn-detalle.active')?.getAttribute('data-producto');
            if (!productoId) return;

            const producto = productosData[productoId];
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Por favor, inicia sesión para realizar una compra.');
                const loginBtn = document.getElementById('showLoginButton');
                if (loginBtn) loginBtn.click();
                return;
            }

            // Guardar el producto para checkout y redirigir
            localStorage.setItem('productoParaComprar', JSON.stringify({
                id: productoId,
                nombre: producto.nombre,
                precio: producto.precioNumerico,
                cantidad: 1
            }));
            window.location.href = 'checkout.html';
        });
    }
}

// Función para agregar producto al carrito via API
async function agregarAlCarritoAPI(productoId, producto, cantidad) {
    try {
        await api.addToCart(parseInt(productoId), cantidad);
        alert(`¡${producto.nombre} agregado al carrito!`);
    } catch (err) {
        console.error('Error al agregar al carrito:', err);
        alert('Error al agregar producto al carrito. Por favor intenta nuevamente.');
    }
}

// Cargar productos desde la API
async function cargarProductos() {
    try {
        const response = await api.getProducts();
        productosData = {};
        
        // Convertir array a objeto indexado por ID
        response.forEach(producto => {
            productosData[producto.id] = {
                nombre: producto.name,
                precio: `$${producto.price.toLocaleString('es-CO')}`,
                precioNumerico: producto.price,
                imagen: producto.image_url || 'imagenes/placeholder.jpg',
                descripcion: producto.description || '',
                caracteristicas: [
                    `Material: Acero quirúrgico premium`,
                    `Técnica: Balinería artesanal`,
                    `Acabado: Resistente`,
                    `Garantía: 1 año contra defectos`,
                    `Categoría: ${producto.category_id || 'General'}`
                ]
            };
        });
        
        renderizarCatalogo();
    } catch (err) {
        console.error('Error al cargar productos:', err);
        alert('Error al cargar el catálogo. Por favor, intenta nuevamente.');
    }
}

// Función para filtrar productos
function filtrarProductos() {
    const busquedaInput = document.getElementById('busqueda');
    const terminoBusqueda = busquedaInput ? busquedaInput.value.toLowerCase() : '';
    const categoriaSelect = document.getElementById('categoria');
    const categoriaSeleccionada = categoriaSelect ? categoriaSelect.value : 'todos';
    const precioSelect = document.getElementById('precio');
    const rangoPrecio = precioSelect ? precioSelect.value : 'todos';

    if (!productosContainer) return;
    const cards = Array.from(productosContainer.querySelectorAll('.card'));

    cards.forEach(card => {
        const nombreProducto = card.querySelector('h3').textContent.toLowerCase();
        const precioProducto = parseInt(card.getAttribute('data-precio'));

        let coincideBusqueda = nombreProducto.includes(terminoBusqueda);
        let coincideCategoria = categoriaSeleccionada === 'todos' || card.getAttribute('data-categoria') === categoriaSeleccionada;
        let coincidePrecio = rangoPrecio === 'todos' || verificarRangoPrecio(precioProducto, rangoPrecio);

        if (coincideBusqueda && coincideCategoria && coincidePrecio) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para verificar rango de precio
function verificarRangoPrecio(precio, rango) {
    switch (rango) {
        case '120-140':
            return precio >= 120000 && precio <= 140000;
        case '140-160':
            return precio >= 140000 && precio <= 160000;
        case '160-180':
            return precio >= 160000 && precio <= 180000;
        default:
            return true;
    }
}

// Función para ordenar productos
function ordenarProductos() {
    const ordenarSelect = document.getElementById('ordenar');
    const criterio = ordenarSelect ? ordenarSelect.value : 'popularidad';
    
    if (!productosContainer) return;
    const cards = Array.from(productosContainer.querySelectorAll('.card'));
    const productosVisibles = cards.filter(card => card.style.display !== 'none');

    productosVisibles.sort((a, b) => {
        const nombreA = a.querySelector('h3').textContent.toLowerCase();
        const nombreB = b.querySelector('h3').textContent.toLowerCase();
        const precioA = parseInt(a.getAttribute('data-precio'));
        const precioB = parseInt(b.getAttribute('data-precio'));

        switch (criterio) {
            case 'precio-asc':
                return precioA - precioB;
            case 'precio-desc':
                return precioB - precioA;
            case 'nombre':
                return nombreA.localeCompare(nombreB);
            case 'popularidad':
            default:
                return 0;
        }
    });

    productosVisibles.forEach(card => {
        productosContainer.appendChild(card);
    });
}

// Función para limpiar filtros
function limpiarFiltros() {
    const busquedaInput = document.getElementById('busqueda');
    const categoriaSelect = document.getElementById('categoria');
    const precioSelect = document.getElementById('precio');
    const ordenarSelect = document.getElementById('ordenar');
    
    if (busquedaInput) busquedaInput.value = '';
    if (categoriaSelect) categoriaSelect.value = 'todos';
    if (precioSelect) precioSelect.value = 'todos';
    if (ordenarSelect) ordenarSelect.value = 'popularidad';
    filtrarProductos();
}

// Evento principal
document.addEventListener('DOMContentLoaded', async function () {
    // Cargar productos desde la API
    await cargarProductos();
    
    // Elementos para filtros
    const busquedaInput = document.getElementById('busqueda');
    const categoriaSelect = document.getElementById('categoria');
    const precioSelect = document.getElementById('precio');
    const aplicarFiltrosBtn = document.getElementById('aplicar-filtros');
    const limpiarFiltrosBtn = document.getElementById('limpiar-filtros');
    const ordenarSelect = document.getElementById('ordenar');
    const cerrarModal = document.getElementById('cerrar-modal');

    // Event listeners para filtros
    if (aplicarFiltrosBtn) aplicarFiltrosBtn.addEventListener('click', filtrarProductos);
    if (limpiarFiltrosBtn) limpiarFiltrosBtn.addEventListener('click', limpiarFiltros);
    if (ordenarSelect) ordenarSelect.addEventListener('change', ordenarProductos);
    if (busquedaInput) busquedaInput.addEventListener('input', filtrarProductos);

    // Event listener para cerrar modal
    if (cerrarModal) {
        cerrarModal.addEventListener('click', function () {
            if (modal) modal.style.display = 'none';
        });
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function (event) {
        if (modal && event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Funcionalidad del carrito en el header
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Por favor, inicia sesión para ver tu carrito.');
                const loginBtn = document.getElementById('showLoginButton');
                if (loginBtn) loginBtn.click();
                return;
            }
            window.location.href = 'miperfil.html#carrito';
        });
    }
});
