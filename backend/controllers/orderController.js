const Order = require('../models/Order');
const Cart = require('../models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    console.log('Creating payment intent for sessionId:', sessionId);

    const cart = await Cart.findOne({ sessionId });
    console.log('Cart found:', cart);
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create order
    const order = new Order({
      sessionId,
      items: cart.items,
      totalPrice: cart.totalPrice,
      status: 'pending',
    });

    await order.save();
    console.log('Order created:', order._id);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(cart.totalPrice * 100), // Amount in paise (INR uses 100 paise = 1 rupee)
      currency: 'inr',
      metadata: {
        orderId: order._id.toString(),
        sessionId,
      },
    });

    console.log('Stripe payment intent created:', paymentIntent.id);

    order.stripePaymentId = paymentIntent.id;
    await order.save();

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ 
      message: 'Error creating payment intent', 
      error: error.message || error 
    });
  }
};

// Get orders by session
exports.getOrdersBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const orders = await Order.find({ sessionId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
};

// Confirm payment (called after Stripe payment succeeds)
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, customerName, customerEmail } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findOne({
        stripePaymentId: paymentIntentId,
      });

      if (order) {
        order.status = 'completed';
        if (customerName) order.customerName = customerName;
        if (customerEmail) order.customerEmail = customerEmail;
        await order.save();

        // Clear cart after successful payment
        await Cart.findOneAndDelete({ sessionId: order.sessionId });

        return res.status(200).json({
          message: 'Payment successful',
          order,
        });
      }
    }

    res.status(400).json({ message: 'Payment not confirmed' });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment', error });
  }
};
