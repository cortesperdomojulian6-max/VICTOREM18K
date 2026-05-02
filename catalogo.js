// Variable global para almacenar productos desde la API
let productosData = {};

// Cargar productos desde la API
async function cargarProductos() {
  try {
    const response = await api.getProducts();
    productosData = {};
    
    // Convertir array a objeto indexado por ID para compatibilidad con código existente
    response.forEach(producto => {
      productosData[producto.id] = {
        nombre: producto.name,
        precio: `$${producto.price.toLocaleString('es-CO')}`,
        precioNumerico: producto.price,
        imagen: producto.image || 'imagenes/placeholder.jpg',
        descripcion: producto.description,
        caracteristicas: [
          `Material: Acero quirúrgico premium`,
          `Técnica: Balinería artesanal`,
          `Acabado: Resistente`,
          `Garantía: 1 año contra defectos`,
          `Categoría: ${producto.category_id}`
        ]
      };
    });
    
    renderizarCatalogo();
  } catch (err) {
    console.error('Error al cargar productos:', err);
    alert('Error al cargar el catálogo. Por favor, intenta nuevamente.');
  }
}

// Datos de los productos (para fallback si API falla)
const productos = {
    1: {
        nombre: "Pulsera Clásica Dorada",
        precio: "$125.000",
        imagen: "imagenes/balines dorados.jpeg",
        descripcion: "Elegante pulsera con diseño tradicional en balinería y acabado dorado de alta calidad. Perfecta para ocasiones formales y uso diario.",
        caracteristicas: [
            "Material: Acero inoxidable con baño de oro",
            "Técnica: Balinería tradicional",
            "Cierre: Seguro de resorte",
            "Ajuste: Universal para muñecas de 15-18 cm",
            "Garantía: 1 año contra defectos de fabricación"
        ]
    },
    2: {
        nombre: "Pulsera Van Cleef Dorada",
        precio: "$165.000",
        imagen: "imagenes/van cleef dorada.jpeg",
        descripcion: "Diseño contemporáneo con balinería de diferentes tamaños y acabado plateado brillante. Ideal para quienes buscan un estilo moderno y sofisticado.",
        caracteristicas: [
            "Material: Acero quirúrgico 316L",
            "Técnica: Balinería multiformato",
            "Cierre: Doble seguro magnético",
            "Ajuste: Personalizable",
            "Resistente al agua y al sudor"
        ]
    },
    3: {
        nombre: "Pulsera Van Cleef negra",
        precio: "$150.000",
        imagen: "imagenes/van cleef negra.jpeg",
        descripcion: "Edición especial con balinería de alta gama y detalles únicos en acabado dorado rosa. Una pieza exclusiva para ocasiones especiales.",
        caracteristicas: [
            "Material: Acero inoxidable con baño de oro rosa",
            "Técnica: Balinería premium de precisión",
            "Cierre: Seguro de lujo con doble mecanismo",
            "Incluye: Estuche de regalo premium",
            "Garantía: 2 años"
        ]
    },
    4: {
        nombre: "Pulsera Van Cleef Roja",
        precio: "$150.000",
        imagen: "imagenes/van cleef roja.jpeg",
        descripcion: "Diseño vanguardista con patrones geométricos en acabado negro mate resistente. Para quienes buscan un estilo urbano y contemporáneo.",
        caracteristicas: [
            "Material: Acero con recubrimiento PVD negro",
            "Técnica: Balinería geométrica artesanal",
            "Cierre: Seguro deslizante ajustable",
            "Resistente: A rayaduras y desgaste",
            "Estilo: Unisex"
        ]
    },
    5: {
        nombre: "Anillo Clásico Dorado",
        precio: "$50.000",
        imagen: "imagenes/AnilloDiseñoExclusivo.jpg",
        descripcion: "Anillo tradicional con diseño en balinería y acabado dorado de larga duración. Elegancia atemporal para cualquier ocasión.",
        caracteristicas: [
            "Material: Acero inoxidable con baño de oro",
            "Técnica: Balinería tradicional",
            "Tallas disponibles: 12-20",
            "Acabado: Brillante de alta resistencia",
            "Incluye: Estuche de regalo"
        ]
    },
    6: {
        nombre: "Anillo Tres Carriles Diamantado",
        precio: "$75.000",
        imagen: "imagenes/AnilloTresCarriles.jpg",
        descripcion: "Diseño contemporáneo con detalles únicos en balinería y acabado plateado brillante. Perfecto para complementar tu estilo personal.",
        caracteristicas: [
            "Material: Acero quirúrgico 316L",
            "Técnica: Balinería con diseño asimétrico",
            "Tallas disponibles: 12-20",
            "Acabado: Plateado brillante resistente",
            "Garantía: 1 año"
        ]
    },
    7: {
        nombre: "Anillo Tres Carriles Liso",
        precio: "$50.000",
        imagen: "imagenes/AnilloTresCarrilesLiso.jpg",
        descripcion: "Diseño contemporáneo con dije central en balinería y cadena ajustable. Una pieza versátil que combina con cualquier estilo.",
        caracteristicas: [
            "Material: Acero inoxidable con baño de plata",
            "Longitud: Cadena ajustable 40-50 cm",
            "Dije: Diseño en balinería de 3 cm",
            "Cierre: Seguro de resorte",
            "Resistente: Al agua y la oxidación"
        ]
    },
    8: {
        nombre: "Manilla 7 Balines Diamantada",
        precio: "$120.000",
        imagen: "imagenes/Manilla7BalinesDiamantada.jpg",
        descripcion: "Edición limitada con diseño exclusivo y detalles en balinería de alta calidad. La pieza perfecta para hacer una declaración de estilo.",
        caracteristicas: [
            "Material: Acero quirúrgico premium",
            "Longitud: 45 cm con extensión de 5 cm",
            "Dije: Diseño exclusivo en balinería",
            "Cierre: Seguro de doble bloqueo",
            "Incluye: Certificado de autenticidad"
        ]
    },
    9: {
        nombre: "Manilla Bolsa Dinero",
        precio: "$120.000",
        imagen: "imagenes/ManillaBolsaDinero.jpg",
        descripcion: "Edición limitada con diseño exclusivo y detalles en balinería de alta calidad. La pieza perfecta para hacer una declaración de estilo.",
        caracteristicas: [
            "Material: Acero quirúrgico premium",
            "Longitud: 45 cm con extensión de 5 cm",
            "Dije: Diseño exclusivo en balinería",
            "Cierre: Seguro de doble bloqueo",
            "Incluye: Certificado de autenticidad"
        ]

    },
    10: {
        nombre: "Manilla Diamantada Centrado",
        precio: "$120.000",
        imagen: "imagenes/ManillaDiamantadaCentro.jpg",
        descripcion: "Edición limitada con diseño exclusivo y detalles en balinería de alta calidad. La pieza perfecta para hacer una declaración de estilo.",
        caracteristicas: [
            "Material: Acero quirúrgico premium",
            "Longitud: 45 cm con extensión de 5 cm",
            "Dije: Diseño exclusivo en balinería",
            "Cierre: Seguro de doble bloqueo",
            "Incluye: Certificado de autenticidad"
        ]
    },
    11: {
        nombre: "Manilla Dollar",
        precio: "$150.000",
        imagen: "imagenes/ManillaDollar.jpg",
        descripcion: "Edición limitada con diseño exclusivo y detalles en balinería de alta calidad. La pieza perfecta para hacer una declaración de estilo.",
        caracteristicas: [
            "Material: Acero quirúrgico premium",
            "Longitud: 45 cm con extensión de 5 cm",
            "Dije: Diseño exclusivo en balinería",
            "Cierre: Seguro de doble bloqueo",
            "Incluye: Certificado de autenticidad"
        ]
    },
    12: {
        nombre: "Manilla Full Balin Liso",
        precio: "$115.000",
        imagen: "imagenes/ManillaFullBalinLiso.jpg",
        descripcion: "Edición limitada con diseño exclusivo y detalles en balinería de alta calidad. La pieza perfecta para hacer una declaración de estilo.",
        caracteristicas: [
            "Material: Acero quirúrgico premium",
            "Longitud: 45 cm con extensión de 5 cm",
            "Dije: Diseño exclusivo en balinería",
            "Cierre: Seguro de doble bloqueo",
            "Incluye: Certificado de autenticidad"
        ]
    },

};

// Sistema de autenticación y renderizado
document.addEventListener('DOMContentLoaded', function () {
    
    // Cargar productos desde la API primero
    cargarProductos().then(() => {
        console.log('Productos cargados exitosamente');
    }).catch(err => {
        console.error('Error cargando productos:', err);
    });
    
    // Elementos del DOM para filtros y búsqueda
    const busquedaInput = document.getElementById('busqueda');
    const categoriaSelect = document.getElementById('categoria');
    const precioSelect = document.getElementById('precio');
    const aplicarFiltrosBtn = document.getElementById('aplicar-filtros');
    const limpiarFiltrosBtn = document.getElementById('limpiar-filtros');
    const ordenarSelect = document.getElementById('ordenar');
    const productosContainer = document.getElementById('lista-productos');
    const modal = document.getElementById('modal-producto');
    const cerrarModal = document.getElementById('cerrar-modal');
    const modalNombre = document.getElementById('modal-nombre');
    const modalPrecio = document.getElementById('modal-precio');
    const modalImagen = document.getElementById('modal-imagen');
    const modalDescripcion = document.getElementById('modal-descripcion');
    const modalCaracteristicas = document.getElementById('modal-caracteristicas');

    // Funcionalidad del carrito
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
      cartIcon.addEventListener('click', function() {
        // Verificar si el usuario está autenticado
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Por favor, inicia sesión para ver tu carrito.');
          // Mostrar modal de login desde header compartido
          const loginBtn = document.getElementById('showLoginButton');
          if (loginBtn) loginBtn.click();
          return;
        }
        // Redirigir a la sección del carrito en miperfil.html
        window.location.href = 'miperfil.html#carrito';
      });
    }

    // Función para renderizar el catálogo
    function renderizarCatalogo() {
        if (!productosContainer) return;
        
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
        // Event listeners para ver detalles
        document.querySelectorAll('.btn-detalle').forEach(boton => {
            boton.addEventListener('click', function () {
                const productoId = this.getAttribute('data-producto');
                const producto = productosData[productoId];

                if (producto && modal) {
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

    // Función para filtrar productos (búsqueda en tiempo real)
    function filtrarProductos() {
        const terminoBusqueda = busquedaInput ? busquedaInput.value.toLowerCase() : '';
        const categoriaSeleccionada = categoriaSelect ? categoriaSelect.value : 'todos';
        const rangoPrecio = precioSelect ? precioSelect.value : 'todos';

        const cards = productosContainer ? Array.from(productosContainer.querySelectorAll('.card')) : [];

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

        // Actualizar título del catálogo
        const catalogoTitulo = document.querySelector('.catalogo-titulo');
        if (catalogoTitulo) {
            const productosVisibles = cards.filter(card => card.style.display !== 'none').length;
            catalogoTitulo.textContent = productosVisibles === Object.keys(productosData).length ?
                'Todos los Productos' :
                `Productos Encontrados (${productosVisibles})`;
        }
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
        const criterio = ordenarSelect ? ordenarSelect.value : 'popularidad';
        const cards = productosContainer ? Array.from(productosContainer.querySelectorAll('.card')) : [];
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

        // Reorganizar productos
        productosVisibles.forEach(card => {
            productosContainer.appendChild(card);
        });
    }

    // Función para limpiar filtros
    function limpiarFiltros() {
        if (busquedaInput) busquedaInput.value = '';
        if (categoriaSelect) categoriaSelect.value = 'todos';
        if (precioSelect) precioSelect.value = 'todos';
        if (ordenarSelect) ordenarSelect.value = 'popularidad';
        filtrarProductos();
    }

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
});

// En la función que maneja el botón "Comprar ahora", agregar:
function comprarAhora(producto) {
  // Verificar si el usuario está autenticado
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) {
    alert('Por favor, inicia sesión para realizar una compra.');
    // Aquí podrías redirigir a la página de login
    return;
  }
  
  // Crear objeto de pedido
  const pedido = {
    tipo: 'catalogo',
    producto: producto,
    cantidad: 1,
    total: producto.precio,
    fecha: new Date().toISOString()
  };
  
  // Guardar pedido en localStorage
  localStorage.setItem('pedidoActual', JSON.stringify(pedido));
  
  // Redirigir a checkout
  window.location.href = 'checkout.html';
}