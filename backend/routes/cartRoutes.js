const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

router.post('/add', addToCart);
router.get('/:sessionId', getCart);
router.put('/update', updateCartItem);
router.post('/remove', removeFromCart);
router.post('/clear', clearCart);

module.exports = router;
