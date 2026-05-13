async function loadSharedFooter() {
  const root = document.getElementById('footer-root');
  if (!root) return;

  try {
    const response = await fetch('/components/shared-footer.html');
    if (!response.ok) {
      console.error('No se pudo cargar el footer compartido:', response.statusText);
      return;
    }
    root.innerHTML = await response.text();
  } catch (err) {
    console.error('Error cargando el footer compartido:', err);
  }
}

window.loadSharedFooter = loadSharedFooter;
