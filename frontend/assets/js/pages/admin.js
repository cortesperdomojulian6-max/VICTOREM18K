document.addEventListener('DOMContentLoaded', async function() {
  await loadSharedHeader();
  initAuth();
  fetchUsers();
});

async function fetchUsers() {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Cargando...';
  try {
    const res = await fetch('/api/admin/users');
    if (!res.ok) throw new Error('Error ' + res.status);
    const users = await res.json();
    render(users);
    statusEl.textContent = `Usuarios: ${users.length}`;
  } catch (e) {
    statusEl.textContent = 'Error al cargar usuarios: ' + e.message;
  }
}

function render(users) {
  const tbody = document.querySelector('#users-table tbody');
  tbody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    const d = new Date(u.registrationDate || 0);
    const dateText = isNaN(d.getTime()) ? '' : d.toLocaleString();
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${esc(u.name || '')}</td>
      <td>${esc(u.email || '')}</td>
      <td>${dateText}</td>
      <td><button data-id="${u.id}" class="del">Borrar</button></td>
    `;
    tbody.appendChild(tr);
  });
  document.querySelectorAll('button.del').forEach(btn => btn.addEventListener('click', onDelete));
}

/* escapeHtml replaced by global esc() from auth.js */

async function onDelete(e) {
  const id = e.currentTarget.dataset.id;
  if (!confirm('Borrar usuario ID ' + id + '?')) return;
  try {
    const res = await fetch('/api/admin/users/' + id, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error ' + res.status);
    await res.json();
        showToast('Usuario eliminado', 'success');
    fetchUsers();
  } catch (err) {
        showToast('Error al eliminar usuario', 'error');
  }
}
