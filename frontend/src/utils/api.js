import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product API
export const fetchProducts = () => apiClient.get('/products');
export const fetchProductById = (id) => apiClient.get(`/products/${id}`);

// Order API
export const createPaymentIntent = (sessionId) =>
  apiClient.post('/orders/create-payment-intent', { sessionId });

export const getOrdersBySession = (sessionId) =>
  apiClient.get(`/orders/session/${sessionId}`);

export const getOrderById = (orderId) =>
  apiClient.get(`/orders/${orderId}`);

export const confirmPayment = (paymentIntentId, customerDetails = {}) =>
  apiClient.post('/orders/confirm-payment', { paymentIntentId, ...customerDetails });
