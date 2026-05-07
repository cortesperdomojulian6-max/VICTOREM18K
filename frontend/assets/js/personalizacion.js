document.addEventListener('DOMContentLoaded', function() {
  // Datos de personalización
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

  // Precios
  const precios = {
    pulsera: {
      base: 80000,
      balin: 5000
    },
    anillo: {
      base: 50000,
      balin: 5000
    },
    dijes: {
      "sin-dije": { nombre: "Sin Dije", precio: 0 },
      "van-cleef": { nombre: "Van Cleef", precio: 30000 },
      "san-benito": { nombre: "San Benito", precio: 25000 },
      "bolsa-dinero": { nombre: "Bolsa de Dinero", precio: 20000 },
      "dolar": { nombre: "Dólar", precio: 20000 },
      "rolex": { nombre: "Rolex", precio: 35000 }
    }
  };

  // Elementos del DOM
  const pasos = document.querySelectorAll('.paso');
  const contenidosPasos = document.querySelectorAll('.paso-contenido');
  const textoPaso2 = document.getElementById('texto-paso-2');
  const opcionesDijes = document.getElementById('opciones-dijes');
  
  // Botones de navegación
  const botonesSiguiente = document.querySelectorAll('[id^="siguiente-paso-"]');
  const botonesAnterior = document.querySelectorAll('[id^="anterior-paso-"]');
  
  // Controles de cantidad de balines
  const disminuirBalines = document.getElementById('disminuir-balines');
  const aumentarBalines = document.getElementById('aumentar-balines');
  const cantidadBalines = document.getElementById('cantidad-balines');
  
  // Botón para proceder al pago
  const procederPagoBtn = document.getElementById('proceder-pago-personalizado');
  const agregarAlCarritoBtn = document.getElementById('agregar-al-carrito');

  // Inicializar eventos
  function inicializarEventos() {
    // Eventos para selección de tipo de joya
    document.querySelectorAll('#paso-1 .opcion').forEach(opcion => {
      opcion.addEventListener('click', function() {
        document.querySelectorAll('#paso-1 .opcion').forEach(o => o.classList.remove('seleccionada'));
        this.classList.add('seleccionada');
        datosPersonalizacion.tipoJoya = this.getAttribute('data-tipo');
        
        // Actualizar texto del paso 2 según el tipo de joya
        if (datosPersonalizacion.tipoJoya === 'pulsera') {
          textoPaso2.textContent = 'Dije';
        } else {
          textoPaso2.textContent = 'Color';
        }
      });
    });

    // Eventos para selección de color
    document.querySelectorAll('#paso-3 .opcion').forEach(opcion => {
      opcion.addEventListener('click', function() {
        document.querySelectorAll('#paso-3 .opcion').forEach(o => o.classList.remove('seleccionada'));
        this.classList.add('seleccionada');
        datosPersonalizacion.colorHilo = this.getAttribute('data-color');
      });
    });

    // Eventos para cantidad de balines
    disminuirBalines.addEventListener('click', function() {
      let valor = parseInt(cantidadBalines.value);
      if (valor > 4) {
        cantidadBalines.value = valor - 2;
        datosPersonalizacion.cantidadBalines = parseInt(cantidadBalines.value);
      }
    });

    aumentarBalines.addEventListener('click', function() {
      let valor = parseInt(cantidadBalines.value);
      if (valor < 10) {
        cantidadBalines.value = valor + 2;
        datosPersonalizacion.cantidadBalines = parseInt(cantidadBalines.value);
      }
    });

    // Eventos para botones de navegación
    botonesSiguiente.forEach(boton => {
      boton.addEventListener('click', function() {
        const pasoActual = parseInt(this.getAttribute('id').split('-')[2]);
        if (validarPaso(pasoActual)) {
          avanzarPaso(pasoActual);
        }
      });
    });

    botonesAnterior.forEach(boton => {
      boton.addEventListener('click', function() {
        const pasoActual = parseInt(this.getAttribute('id').split('-')[2]);
        retrocederPaso(pasoActual);
      });
    });

    // Evento para proceder al pago
    procederPagoBtn.addEventListener('click', function() {
      procederAlPago();
    });

    // Evento para agregar al carrito
    if (agregarAlCarritoBtn) {
      agregarAlCarritoBtn.addEventListener('click', function() {
        // Asegurarnos de tener el resumen actualizado
        calcularResumen();

        // Construir el item para el carrito
        const tipo = datosPersonalizacion.tipoJoya;
        const imagen = tipo === 'pulsera' ? '/assets/images/pulsera icono.png' : '/assets/images/anillo icono.png';
        const nombre = tipo === 'pulsera' ? 'Pulsera Personalizada' : 'Anillo Personalizado';
        const precioFormateado = '$' + datosPersonalizacion.total.toLocaleString();

        const item = {
          id: 'personalizado-' + Date.now(),
          nombre: nombre,
          precio: precioFormateado,
          imagen: imagen,
          cantidad: 1,
          detalles: { ...datosPersonalizacion }
        };

        // Guardar en localStorage
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito.push(item);
        localStorage.setItem('carrito', JSON.stringify(carrito));

        // Avisar al usuario y ofrecer ir al carrito
        const irAlCarrito = confirm('Producto agregado al carrito. ¿Deseas ir al carrito ahora?');
        if (irAlCarrito) {
          const user = JSON.parse(localStorage.getItem('currentUser'));
          if (user) {
            window.location.href = 'miperfil.html#carrito';
          } else {
            // Si no está autenticado, pedir iniciar sesión
            window.location.href = 'index.html#login';
          }
        }
      });
    }
  }

  // Validar paso actual
  function validarPaso(paso) {
    const mensajeError = document.getElementById(`error-paso-${paso}`);
    let valido = true;

    switch(paso) {
      case 1:
        if (!datosPersonalizacion.tipoJoya) {
          mensajeError.style.display = 'block';
          valido = false;
        } else {
          mensajeError.style.display = 'none';
        }
        break;
      case 2:
        if (datosPersonalizacion.tipoJoya === 'pulsera' && !datosPersonalizacion.dije) {
          mensajeError.style.display = 'block';
          valido = false;
        } else {
          mensajeError.style.display = 'none';
        }
        break;
      case 3:
        if (!datosPersonalizacion.colorHilo) {
          mensajeError.style.display = 'block';
          valido = false;
        } else {
          mensajeError.style.display = 'none';
        }
        break;
      case 4:
        const cantidad = parseInt(cantidadBalines.value);
        if (cantidad < 4 || cantidad > 10 || cantidad % 2 !== 0) {
          mensajeError.style.display = 'block';
          valido = false;
        } else {
          mensajeError.style.display = 'none';
        }
        break;
    }

    return valido;
  }

  // Avanzar al siguiente paso
  function avanzarPaso(pasoActual) {
    // Preparar el siguiente paso si es necesario
    if (pasoActual === 1 && datosPersonalizacion.tipoJoya === 'pulsera') {
      cargarOpcionesDijes();
    } else if (pasoActual === 1 && datosPersonalizacion.tipoJoya === 'anillo') {
      // Si es anillo, saltamos el paso de dijes
      pasoActual = 2;
    }

    // Actualizar pasos visualmente
    actualizarPasosVisualmente(pasoActual);

    // Ocultar paso actual y mostrar siguiente
    contenidosPasos.forEach(contenido => contenido.classList.remove('activo'));
    document.getElementById(`paso-${pasoActual + 1}`).classList.add('activo');

    // Si estamos en el último paso, calcular resumen
    if (pasoActual === 4) {
      calcularResumen();
    }
  }

  // Retroceder al paso anterior
  function retrocederPaso(pasoActual) {
    let pasoAnterior = pasoActual - 1;
    
    // Si estamos en el paso 3 y es un anillo, retrocedemos al paso 1
    if (pasoActual === 3 && datosPersonalizacion.tipoJoya === 'anillo') {
      pasoAnterior = 1;
    }
    
    // Actualizar pasos visualmente
    actualizarPasosVisualmente(pasoAnterior - 1);

    // Ocultar paso actual y mostrar anterior
    contenidosPasos.forEach(contenido => contenido.classList.remove('activo'));
    document.getElementById(`paso-${pasoAnterior}`).classList.add('activo');
  }

  // Actualizar visualización de pasos
  function actualizarPasosVisualmente(pasoActual) {
    pasos.forEach((paso, index) => {
      const numeroPaso = index + 1;
      paso.classList.remove('activo', 'completado');
      
      if (numeroPaso === pasoActual + 1) {
        paso.classList.add('activo');
      } else if (numeroPaso < pasoActual + 1) {
        paso.classList.add('completado');
      }
    });
  }

  // Cargar opciones de dijes
  function cargarOpcionesDijes() {
    opcionesDijes.innerHTML = '';
    
    for (const [clave, valor] of Object.entries(precios.dijes)) {
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
        datosPersonalizacion.dije = this.getAttribute('data-dije');
      });
      
      opcionesDijes.appendChild(opcion);
    }
  }

  // Calcular resumen del pedido
  function calcularResumen() {
    // Determinar precio base según tipo de joya
    if (datosPersonalizacion.tipoJoya === 'pulsera') {
      datosPersonalizacion.precioBase = precios.pulsera.base;
      datosPersonalizacion.precioBalines = precios.pulsera.balin * datosPersonalizacion.cantidadBalines;
    } else {
      datosPersonalizacion.precioBase = precios.anillo.base;
      datosPersonalizacion.precioBalines = precios.anillo.balin * datosPersonalizacion.cantidadBalines;
    }
    
    // Determinar precio del dije
    if (datosPersonalizacion.dije) {
      datosPersonalizacion.precioDije = precios.dijes[datosPersonalizacion.dije].precio;
    } else {
      datosPersonalizacion.precioDije = 0;
    }
    
    // Calcular total
    datosPersonalizacion.total = datosPersonalizacion.precioBase + datosPersonalizacion.precioDije + datosPersonalizacion.precioBalines;
    
    // Actualizar resumen en la interfaz
    document.getElementById('resumen-tipo').textContent = datosPersonalizacion.tipoJoya === 'pulsera' ? 'Pulsera' : 'Anillo';
    
    if (datosPersonalizacion.tipoJoya === 'pulsera') {
      document.getElementById('resumen-dije-container').style.display = 'flex';
      document.getElementById('resumen-dije').textContent = precios.dijes[datosPersonalizacion.dije].nombre;
    } else {
      document.getElementById('resumen-dije-container').style.display = 'none';
    }
    
    document.getElementById('resumen-color').textContent = datosPersonalizacion.colorHilo === 'rojo' ? 'Rojo' : 'Negro';
    document.getElementById('resumen-balines').textContent = datosPersonalizacion.cantidadBalines;
    document.getElementById('resumen-precio-base').textContent = '$' + datosPersonalizacion.precioBase.toLocaleString();
    document.getElementById('resumen-precio-dije').textContent = '$' + datosPersonalizacion.precioDije.toLocaleString();
    document.getElementById('resumen-precio-balines').textContent = '$' + datosPersonalizacion.precioBalines.toLocaleString();
    document.getElementById('resumen-total').textContent = '$' + datosPersonalizacion.total.toLocaleString();
  }

  // Proceder al pago
  function procederAlPago() {
    // Verificar si el usuario está autenticado
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      alert('Por favor, inicia sesión para proceder al pago.');
      // Aquí podrías redirigir a la página de login
      return;
    }
    
    // Guardar el pedido personalizado en localStorage
    const pedidoPersonalizado = {
      tipo: 'personalizado',
      detalles: { ...datosPersonalizacion },
      total: datosPersonalizacion.total,
      fecha: new Date().toISOString()
    };
    
    localStorage.setItem('pedidoActual', JSON.stringify(pedidoPersonalizado));
    
    // Redirigir a la página de checkout
    window.location.href = 'checkout.html';
  }

  // Inicializar la aplicación
  inicializarEventos();
});