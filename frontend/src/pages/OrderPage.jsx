import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { getOrdersBySession } from '../utils/api';
import '../styles/OrderPage.css';

const OrderPage = () => {
  const { sessionId } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!sessionId) return;

      try {
        const response = await getOrdersBySession(sessionId);
        setOrders(response.data);
      } catch (err) {
        setError('Failed to load orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [sessionId]);

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h2>Your Orders</h2>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders yet. Start shopping!</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <strong>Order ID:</strong> {order._id}
                  </div>
                  <div className={`order-status ${order.status}`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>

                {order.customerName && (
                  <div className="order-customer">
                    <strong>Customer:</strong> {order.customerName}
                  </div>
                )}

                {order.customerEmail && (
                  <div className="order-email">
                    <strong>Email:</strong> {order.customerEmail}
                  </div>
                )}

                <div className="order-date">
                  <strong>Date:</strong>{' '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>

                <div className="order-items">
                  <strong>Items:</strong>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x {item.quantity} - ₹
                        {(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-total">
                  <strong>Total:</strong> ₹{order.totalPrice.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
