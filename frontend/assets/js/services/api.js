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

export async function getProducts() {
  return apiRequest('/products');
}

export async function getProduct(productId) {
  return apiRequest(`/products/${productId}`);
}

export async function getCurrentUser() {
  return apiRequest('/users/me');
}

export async function updateProfile(profileData) {
  return apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
}

export async function changePassword(old_password, new_password) {
  return apiRequest('/users/password', {
    method: 'PUT',
    body: JSON.stringify({ old_password, new_password })
  });
}

export async function deleteAccount() {
  return apiRequest('/users/account', {
    method: 'DELETE'
  });
}

export async function getAddresses() {
  return apiRequest('/addresses');
}

export async function addAddress(addressData) {
  return apiRequest('/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData)
  });
}

export async function updateAddress(addressId, addressData) {
  return apiRequest(`/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData)
  });
}

export async function deleteAddress(addressId) {
  return apiRequest(`/addresses/${addressId}`, {
    method: 'DELETE'
  });
}

export async function createOrder(orderData) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

export async function getOrders() {
  return apiRequest('/orders');
}

export async function getOrder(orderId) {
  return apiRequest(`/orders/${orderId}`);
}

export async function getCart() {
  return apiRequest('/cart');
}

export async function addToCart(product_id, quantity = 1) {
  return apiRequest('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product_id, quantity })
  });
}

export async function updateCartItem(itemId, quantity) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
}

export async function removeFromCart(itemId) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: 'DELETE'
  });
}

export async function clearCart() {
  return apiRequest('/cart', {
    method: 'DELETE'
  });
}
