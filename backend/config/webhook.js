const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object);
      break;
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

const handlePaymentIntentSucceeded = async (paymentIntent) => {
  console.log('Payment succeeded:', paymentIntent.id);

  try {
    const order = await Order.findOne({
      stripePaymentId: paymentIntent.id,
    });

    if (order) {
      order.status = 'completed';
      await order.save();
      console.log(`Order ${order._id} marked as completed`);
    }
  } catch (error) {
    console.error('Error updating order on payment success:', error);
  }
};

const handlePaymentIntentFailed = async (paymentIntent) => {
  console.log('Payment failed:', paymentIntent.id);

  try {
    const order = await Order.findOne({
      stripePaymentId: paymentIntent.id,
    });

    if (order) {
      order.status = 'failed';
      await order.save();
      console.log(`Order ${order._id} marked as failed`);
    }
  } catch (error) {
    console.error('Error updating order on payment failure:', error);
  }
};

const handleChargeRefunded = async (charge) => {
  console.log('Charge refunded:', charge.id);

  try {
    const order = await Order.findOne({
      stripePaymentId: charge.payment_intent,
    });

    if (order) {
      order.status = 'cancelled';
      await order.save();
      console.log(`Order ${order._id} marked as cancelled`);
    }
  } catch (error) {
    console.error('Error updating order on charge refund:', error);
  }
};

module.exports = { handleWebhook };
