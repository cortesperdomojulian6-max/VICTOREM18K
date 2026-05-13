async function loadSharedHeader() {
  const root = document.getElementById('header-root');
  if (!root) return;

  root.innerHTML = '<div class="header-skeleton"><div class="container" style="display:flex;align-items:center;height:70px;gap:16px"><div class="skeleton-line" style="width:120px;height:32px"></div><div class="skeleton-line" style="width:300px;height:16px;margin-left:auto"></div></div></div>';

  try {
    const response = await fetch('/components/shared-header.html');
    if (!response.ok) {
      console.error('No se pudo cargar el header compartido:', response.statusText);
      return;
    }

    root.innerHTML = await response.text();
    updateActiveNavLink();
  } catch (err) {
    console.error('Error cargando el header compartido:', err);
  }
}

function updateActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const activeMap = {
    'index.html': 'Inicio',
    'catalogo.html': 'Catálogo',
    'personalizacion.html': 'Personaliza',
    'historia.html': 'Historia',
    'contacto.html': 'Contacto'
  };
  const activeText = activeMap[path];
  if (!activeText) return;

  document.querySelectorAll('#header-root nav a').forEach(link => {
    if (link.textContent.trim() === activeText) {
      link.classList.add('nav-active');
    }
  });
}

window.loadSharedHeader = loadSharedHeader;
