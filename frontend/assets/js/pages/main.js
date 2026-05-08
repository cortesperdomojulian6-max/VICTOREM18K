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
});
