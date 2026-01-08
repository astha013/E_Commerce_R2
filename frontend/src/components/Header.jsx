import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Header.css';

const Header = () => {
  const { getCartItemCount } = useCart();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>🛍️ EStore</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">
            Products
          </Link>
          <Link to="/cart" className="nav-link cart-link">
            <span className="cart-icon">🛒</span>
            <span className="cart-count">{getCartItemCount()}</span>
          </Link>
          <Link to="/orders" className="nav-link">
            Orders
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
