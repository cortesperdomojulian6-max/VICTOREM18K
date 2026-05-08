async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
}

async function getProducts() {
  return apiRequest('/products');
}

async function getProduct(productId) {
  return apiRequest(`/products/${productId}`);
}

async function fetchCurrentUser() {
  return apiRequest('/users/me');
}

async function updateProfile(profileData) {
  return apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
}

async function changePassword(old_password, new_password) {
  return apiRequest('/users/password', {
    method: 'PUT',
    body: JSON.stringify({ old_password, new_password })
  });
}

async function deleteAccount() {
  return apiRequest('/users/account', {
    method: 'DELETE'
  });
}

async function getAddresses() {
  return apiRequest('/addresses');
}

async function addAddress(addressData) {
  return apiRequest('/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData)
  });
}

async function updateAddress(addressId, addressData) {
  return apiRequest(`/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData)
  });
}

async function deleteAddress(addressId) {
  return apiRequest(`/addresses/${addressId}`, {
    method: 'DELETE'
  });
}

async function createOrder(orderData) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

async function getOrders() {
  return apiRequest('/orders');
}

async function getOrder(orderId) {
  return apiRequest(`/orders/${orderId}`);
}

async function getCart() {
  return apiRequest('/cart');
}

async function addToCart(product_id, quantity = 1) {
  return apiRequest('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product_id, quantity })
  });
}

async function updateCartItem(itemId, quantity) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
}

async function removeFromCart(itemId) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: 'DELETE'
  });
}

async function clearCart() {
  return apiRequest('/cart', {
    method: 'DELETE'
  });
}

window.getProducts = getProducts;
window.getProduct = getProduct;
window.fetchCurrentUser = fetchCurrentUser;
window.updateProfile = updateProfile;
window.changePassword = changePassword;
window.deleteAccount = deleteAccount;
window.getAddresses = getAddresses;
window.addAddress = addAddress;
window.updateAddress = updateAddress;
window.deleteAddress = deleteAddress;
window.createOrder = createOrder;
window.getOrders = getOrders;
window.getOrder = getOrder;
window.getCart = getCart;
window.addToCart = addToCart;
window.updateCartItem = updateCartItem;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
