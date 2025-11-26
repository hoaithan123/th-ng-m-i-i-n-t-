import axios from 'axios';

export const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor để tự động thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('customerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const customerAPI = {
  register: (data) => api.post('/customer/register', data),
  login: (data) => api.post('/customer/login', data),
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data) => api.put('/customer/profile', data),
};

export const storefrontAPI = {
  getProducts: (params) => api.get('/storefront/products', { params }),
  getProductDetail: (id) => api.get(`/storefront/products/${id}`),
  getSuggestions: (q) => api.get('/storefront/suggestions', { params: { q } }),
  getTimeBasedRecommendations: (params) => api.get('/storefront/recommendations/time-based', { params }),
  // Voucher API methods
  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
  getProductReviews: (id, params) => api.get(`/storefront/products/${id}/reviews`, { params }),
  addProductReview: (id, data) => api.post(`/storefront/products/${id}/reviews`, data)
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateCartItem: (id, data) => api.put(`/cart/${id}`, data),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
  post: (url, data) => api.post(`/cart${url}`, data),
  put: (url, data) => api.put(`/cart${url}`, data),
  delete: (url) => api.delete(`/cart${url}`),
};

export const orderAPI = {
  createOrder: (data) => api.post('/order', data),
  getMyOrders: () => api.get('/order/my-orders'),
  getOrderDetail: (id) => api.get(`/order/${id}`),
  cancelOrder: (id) => api.put(`/order/${id}/cancel`),
  updateOrder: (id, data) => api.put(`/order/${id}`, data),
  getStatus: (id) => api.get(`/order/${id}`),
};

export const paymentAPI = {
  createVnpayForCustomer: (orderId) => api.get(`/payment/vnpay/create-customer/${orderId}`),
  createMomoForCustomer: (orderId) => api.get(`/payment/momo/create-customer/${orderId}`),
  getPublicConfig: () => api.get('/payment/config/public'),
  createPaypalForCustomer: (orderId) => api.get(`/payment/paypal/create-customer/${orderId}`),
};

export const comboAPI = {
  getAllCombos: () => api.get('/combo'),
  getComboById: (id) => api.get(`/combo/${id}`),
  addComboToCart: (id, so_luong) => api.post(`/combo/${id}/add-to-cart`, { so_luong }),
};

export default api;