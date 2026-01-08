import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Initialize session ID
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      fetchCart(storedSessionId);
    } else {
      const newSessionId = 'session_' + Date.now() + '_' + Math.random();
      localStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const fetchCart = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cart/${id}`
      );
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!sessionId) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/cart/add`,
        {
          sessionId,
          productId,
          quantity,
        }
      );
      setCart(response.data);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (!sessionId) return;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/cart/update`,
        {
          sessionId,
          productId,
          quantity,
        }
      );
      setCart(response.data);
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!sessionId) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/cart/remove`,
        {
          sessionId,
          productId,
        }
      );
      setCart(response.data);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (!sessionId) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/cart/clear`, {
        sessionId,
      });
      setCart({ sessionId, items: [], totalPrice: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        sessionId,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartItemCount,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
