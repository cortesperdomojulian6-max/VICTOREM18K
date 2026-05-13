function initCarousel() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const slides = track.querySelectorAll('.carousel-slide');
  if (slides.length === 0) return;

  let currentIndex = 0;
  const isMobile = () => window.innerWidth < 768;
  const slidePercent = () => isMobile() ? 100 : 33.333;
  const maxIndex = slides.length - (isMobile() ? 1 : 3);

  function createDots() {
    dotsContainer.innerHTML = '';
    const count = isMobile() ? slides.length : Math.ceil(slides.length / 3);
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir a slide ${i + 1}`);
      dot.addEventListener('click', () => {
        const idx = isMobile() ? i : i * 3;
        goToSlide(Math.min(idx, slides.length - 1));
      });
      dotsContainer.appendChild(dot);
    }
  }

  function goToSlide(index) {
    currentIndex = Math.min(index, maxIndex);
    track.style.transform = `translateX(-${currentIndex * slidePercent()}%)`;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    const activeDot = isMobile() ? currentIndex : Math.floor(currentIndex / 3);
    dots.forEach((d, i) => d.classList.toggle('active', i === activeDot));
  }

  function nextSlide() {
    const step = isMobile() ? 1 : 3;
    goToSlide(currentIndex + step > maxIndex ? 0 : currentIndex + step);
  }

  function prevSlide() {
    const step = isMobile() ? 1 : 3;
    goToSlide(currentIndex - step < 0 ? maxIndex : currentIndex - step);
  }

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  let startX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const diff = startX - e.touches[0].clientX;
    const offset = -currentIndex * slidePercent() - (diff / track.offsetWidth) * 100;
    track.style.transition = 'none';
    track.style.transform = `translateX(${offset}%)`;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.changedTouches[0].clientX;
    track.style.transition = '';
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < maxIndex) goToSlide(currentIndex + 1);
      else if (diff < 0 && currentIndex > 0) goToSlide(currentIndex - 1);
      else goToSlide(currentIndex);
    } else {
      goToSlide(currentIndex);
    }
  }, { passive: true });

  createDots();
  goToSlide(0);

  window.addEventListener('resize', () => {
    goToSlide(0);
    createDots();
  });
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', async function() {
  await loadSharedHeader();
  initAuth();
  initCarousel();
  initScrollReveal();

  try {
    const productos = await getProducts();
    window.__productos = productos.map(p => ({
      id: p.id,
      nombre: p.name,
      descripcion: p.description,
      precio: `$${Number(p.price).toLocaleString('es-CO')}`,
      precioNumerico: Number(p.price),
      imagen: p.image_url ? p.image_url.replace(/^imagenes\//, '/assets/images/') : '/assets/images/placeholder.jpg',
      categoria: p.category || 'pulsos',
      caracteristicas: p.features || []
    }));
  } catch (e) {
    window.__productos = [];
  }

  document.querySelectorAll('.btn-detalle').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-producto');
      const modal = document.getElementById('modal-producto');
      if (!modal) {
        window.location.href = 'catalogo.html';
        return;
      }
      const productos = window.__productos || [];
      const p = productos.find(x => x.id == id);
      if (p) {
        document.getElementById('modal-nombre').textContent = p.nombre;
        document.getElementById('modal-precio').textContent = p.precio;
        document.getElementById('modal-imagen').src = p.imagen;
        document.getElementById('modal-descripcion').textContent = p.descripcion;
        document.getElementById('modal-caracteristicas').innerHTML = (p.caracteristicas || []).map(c => `<li>${c}</li>`).join('');
        modal.dataset.productoId = id;
        modal.style.display = 'flex';
      } else {
        window.location.href = 'catalogo.html';
      }
    });
  });

  document.getElementById('cerrar-modal')?.addEventListener('click', function() {
    document.getElementById('modal-producto').style.display = 'none';
  });

  window.addEventListener('click', function(e) {
    const modal = document.getElementById('modal-producto');
    if (e.target === modal) modal.style.display = 'none';
  });

  document.getElementById('comprar-ahora')?.addEventListener('click', function() {
    if (!isAuthenticated()) {
      showToast('Inicia sesión para comprar', 'info');
      showLoginModal();
      return;
    }
    const modal = document.getElementById('modal-producto');
    const id = modal?.dataset.productoId;
    if (id) window.location.href = `checkout.html?producto=${id}`;
  });

  document.getElementById('agregar-carrito-modal')?.addEventListener('click', async function() {
    if (!isAuthenticated()) {
      showToast('Inicia sesión para agregar al carrito', 'info');
      showLoginModal();
      return;
    }
    const modal = document.getElementById('modal-producto');
    const id = modal?.dataset.productoId;
    if (id) {
      try {
        await addToCart(parseInt(id), 1);
        showToast('Producto agregado al carrito', 'success');
      } catch {
        showToast('Error al agregar al carrito', 'error');
      }
    }
  });
});
