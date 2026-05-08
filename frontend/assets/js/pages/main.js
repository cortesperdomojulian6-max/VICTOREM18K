document.addEventListener('DOMContentLoaded', async function() {
  await loadSharedHeader();
  initAuth();

  const cartIcon = document.getElementById('cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', function() {
      if (!isAuthenticated()) {
        alert('Por favor, inicia sesión para ver tu carrito.');
        showLoginModal();
        return;
      }
      window.location.href = 'miperfil.html#carrito';
    });
  }

  const cartIconFooter = document.getElementById('cart-icon-footer');
  if (cartIconFooter) {
    cartIconFooter.addEventListener('click', function() {
      if (!isAuthenticated()) {
        alert('Por favor, inicia sesión para ver tu carrito.');
        showLoginModal();
        return;
      }
      window.location.href = 'miperfil.html#carrito';
    });
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
