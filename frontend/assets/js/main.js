// ============ FUNCIONALIDAD DEL CARRITO ============
// La autenticación ahora se maneja en auth.js (incluido en todas las páginas)

document.addEventListener('DOMContentLoaded', function() {
  // Funcionalidad del carrito
  const cartIcon = document.getElementById('cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', function() {
      // Verificar si el usuario está autenticado usando auth.js
      if (!window.auth || !window.auth.isAuthenticated()) {
        alert('Por favor, inicia sesión para ver tu carrito.');
        if (window.auth && window.auth.showLoginModal) {
          window.auth.showLoginModal();
        }
        return;
      }
      // Redirigir a la sección del carrito en miperfil.html
      window.location.href = 'miperfil.html#carrito';
    });
  }

  // Funcionalidad del carrito en el footer
  const cartIconFooter = document.getElementById('cart-icon-footer');
  if (cartIconFooter) {
    cartIconFooter.addEventListener('click', function() {
      // Verificar si el usuario está autenticado usando auth.js
      if (!window.auth || !window.auth.isAuthenticated()) {
        alert('Por favor, inicia sesión para ver tu carrito.');
        if (window.auth && window.auth.showLoginModal) {
          window.auth.showLoginModal();
        }
        return;
      }
      // Redirigir a la sección del carrito en miperfil.html
      window.location.href = 'miperfil.html#carrito';
    });
  }
});
    
