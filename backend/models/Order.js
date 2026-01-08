const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    stripePaymentId: String,
    stripeSessionId: String,
    customerEmail: String,
    customerName: String,
    paymentMethod: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
