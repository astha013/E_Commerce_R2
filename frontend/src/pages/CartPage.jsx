import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../utils/api';
import '../styles/CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, sessionId, updateCartItem, removeFromCart, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateCartItem(productId, newQuantity);
    }
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await createPaymentIntent(sessionId);
      console.log('Payment intent response:', response.data);
      
      if (response.data && response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
        setOrderId(response.data.orderId);
        setShowPaymentForm(true);
      } else {
        setError('Failed to get payment details. Please try again.');
      }
    } catch (err) {
      setError(`Failed to create payment: ${err.message || 'Unknown error'}`);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCart = () => {
    setShowPaymentForm(false);
    setClientSecret(null);
    setOrderId(null);
    setError(null);
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Please enter your name and email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName,
            email: customerEmail,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Confirm payment on backend with customer details
        await confirmPayment(result.paymentIntent.id, {
          customerName,
          customerEmail,
        });
        
        // Clear cart on successful payment
        await clearCart();
        
        alert('Payment successful!');
        setCustomerName('');
        setCustomerEmail('');
        navigate('/orders');
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!cart) {
    return <div className="cart-loading">Loading cart...</div>;
  }

  const isEmpty = !cart.items || cart.items.length === 0;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2>Shopping Cart</h2>

        {isEmpty ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              className="continue-shopping-btn"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {!showPaymentForm ? (
              <>
                <div className="cart-items">
                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map((item) => (
                        <tr key={item.productId}>
                          <td className="product-cell">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100x100?text=' + encodeURIComponent(item.name);
                              }}
                            />
                            <span>{item.name}</span>
                          </td>
                          <td>₹{item.price.toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.productId,
                                  parseInt(e.target.value)
                                )
                              }
                              className="quantity-input"
                            />
                          </td>
                          <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <button
                              onClick={() => handleRemove(item.productId)}
                              className="remove-btn"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{cart.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="cart-actions">
                  <button
                    onClick={() => navigate('/')}
                    className="continue-shopping-btn"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="checkout-btn"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                </div>
              </>
            ) : (
              <div className="payment-section">
                <h3>Complete Your Payment</h3>
                <div className="payment-summary">
                  <p>Order Total: <strong>₹{cart.totalPrice.toFixed(2)}</strong></p>
                </div>

                <form onSubmit={handlePayment} className="payment-form">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Details</label>
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                      }}
                    />
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  <div className="payment-actions">
                    <button
                      type="button"
                      onClick={handleBackToCart}
                      className="back-btn"
                      disabled={loading}
                    >
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      className="pay-btn"
                      disabled={!stripe || loading}
                    >
                      {loading ? 'Processing...' : `Pay ₹${cart.totalPrice.toFixed(2)}`}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
