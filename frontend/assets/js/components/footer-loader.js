async function loadSharedFooter() {
  const root = document.getElementById('footer-root');
  if (!root) return;

  try {
    const response = await fetch('/components/shared-footer.html');
    if (!response.ok) {
      console.error('No se pudo cargar el footer compartido:', response.statusText);
      root.innerHTML = '<footer><div class="container"><p>&copy; ' + new Date().getFullYear() + ' Victorem. Todos los derechos reservados.</p></div></footer>';
      return;
    }
    root.innerHTML = await response.text();
  } catch (err) {
    console.error('Error cargando el footer compartido:', err);
    root.innerHTML = '<footer><div class="container"><p>&copy; ' + new Date().getFullYear() + ' Victorem. Todos los derechos reservados.</p></div></footer>';
  }
}

window.loadSharedFooter = loadSharedFooter;
