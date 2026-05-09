function initCarousel() {
  if (window.innerWidth < 768) return;
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const slides = track.querySelectorAll('.carousel-slide');
  if (slides.length === 0) return;

  let currentIndex = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ir a slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  function goToSlide(index) {
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex > 0 ? currentIndex - 1 : slides.length - 1);
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex < slides.length - 1 ? currentIndex + 1 : 0);
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
      alert('Por favor, inicia sesión para comprar.');
      showLoginModal();
      return;
    }
    const modal = document.getElementById('modal-producto');
    const id = modal?.dataset.productoId;
    if (id) window.location.href = `checkout.html?producto=${id}`;
  });

  document.getElementById('agregar-carrito-modal')?.addEventListener('click', async function() {
    if (!isAuthenticated()) {
      alert('Por favor, inicia sesión para agregar al carrito.');
      showLoginModal();
      return;
    }
    const modal = document.getElementById('modal-producto');
    const id = modal?.dataset.productoId;
    if (id) {
      try {
        await addToCart(parseInt(id), 1);
        alert('Producto agregado al carrito.');
      } catch {
        alert('Error al agregar al carrito.');
      }
    }
  });
});
