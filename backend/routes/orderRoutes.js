const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  getOrdersBySession,
  getOrderById,
  confirmPayment,
} = require('../controllers/orderController');

router.post('/create-payment-intent', createPaymentIntent);
router.get('/session/:sessionId', getOrdersBySession);
router.get('/:orderId', getOrderById);
router.post('/confirm-payment', confirmPayment);

module.exports = router;
