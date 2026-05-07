// ============ CLIENTE API CENTRALIZADO ============
// Funciones para interactuar con la API del backend

const API_BASE_URL = 'http://localhost:3001/api';

// Función auxiliar para hacer peticiones autenticadas
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
}

// ============ PRODUCTOS ============

// Obtener todos los productos
async function getProducts() {
  return apiRequest('/products');
}

// Obtener un producto específico
async function getProduct(productId) {
  return apiRequest(`/products/${productId}`);
}

// ============ USUARIOS ============

// Obtener perfil actual
async function getCurrentUser() {
  return apiRequest('/users/me');
}

// Actualizar perfil
async function updateProfile(profileData) {
  return apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
}

// Cambiar contraseña
async function changePassword(old_password, new_password) {
  return apiRequest('/users/password', {
    method: 'PUT',
    body: JSON.stringify({ old_password, new_password })
  });
}

// Eliminar cuenta
async function deleteAccount() {
  return apiRequest('/users/account', {
    method: 'DELETE'
  });
}

// ============ DIRECCIONES ============

// Obtener direcciones
async function getAddresses() {
  return apiRequest('/addresses');
}

// Agregar dirección
async function addAddress(addressData) {
  return apiRequest('/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData)
  });
}

// Actualizar dirección
async function updateAddress(addressId, addressData) {
  return apiRequest(`/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData)
  });
}

// Eliminar dirección
async function deleteAddress(addressId) {
  return apiRequest(`/addresses/${addressId}`, {
    method: 'DELETE'
  });
}

// ============ PEDIDOS ============

// Crear pedido
async function createOrder(orderData) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

// Obtener pedidos del usuario
async function getOrders() {
  return apiRequest('/orders');
}

// Obtener un pedido específico
async function getOrder(orderId) {
  return apiRequest(`/orders/${orderId}`);
}

// ============ CARRITO ============

// Obtener carrito
async function getCart() {
  return apiRequest('/cart');
}

// Agregar producto al carrito
async function addToCart(product_id, quantity = 1) {
  return apiRequest('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product_id, quantity })
  });
}

// Actualizar cantidad en el carrito
async function updateCartItem(itemId, quantity) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
}

// Eliminar item del carrito
async function removeFromCart(itemId) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: 'DELETE'
  });
}

// Vaciar carrito
async function clearCart() {
  return apiRequest('/cart', {
    method: 'DELETE'
  });
}

// Exportar funciones
window.api = {
  getProducts,
  getProduct,
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  createOrder,
  getOrders,
  getOrder,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

