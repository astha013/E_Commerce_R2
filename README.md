# EStore - MERN Checkout System with Stripe Integration

A full-featured e-commerce checkout system built with the MERN stack (MongoDB, Express, React, Node.js) with Stripe payment integration.

## Features

- 🛍️ **Product Listing** - Browse multiple products in card format
- 🛒 **Shopping Cart** - Add/remove items and manage quantities
- 💳 **Stripe Payment** - Secure payment processing with Stripe
- 📋 **Order History** - View all previous transactions
- 🔄 **Order Status** - Real-time order status updates via Stripe webhooks
- 📱 **Responsive Design** - Mobile-friendly interface
- ✨ **No Authentication** - Features available to everyone

## Project Structure

```
checkout/
├── backend/          # Node.js + Express backend
│   ├── models/      # MongoDB schemas
│   ├── routes/      # API routes
│   ├── controllers/ # Business logic
│   ├── config/      # Configuration files
│   └── server.js    # Main server file
└── frontend/        # React frontend
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/      # Page components
    │   ├── context/    # Context API (Cart)
    │   ├── utils/      # API utilities
    │   ├── styles/     # CSS files
    │   └── App.jsx     # Main app component
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Backend Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Stripe account

### Installation

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your configuration:
```env
MONGO_URI=mongodb://localhost:27017/checkout
PORT=5000
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLIC_KEY=pk_test_YOUR_STRIPE_PUBLIC_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### API Endpoints

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (for demo)

#### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart/:sessionId` - Get cart
- `PUT /api/cart/update` - Update item quantity
- `POST /api/cart/remove` - Remove item from cart
- `POST /api/cart/clear` - Clear cart

#### Orders
- `POST /api/orders/create-payment-intent` - Create Stripe payment intent
- `GET /api/orders/session/:sessionId` - Get orders by session
- `GET /api/orders/:orderId` - Get order by ID
- `POST /api/orders/confirm-payment` - Confirm payment

#### Webhook
- `POST /api/webhook` - Stripe webhook handler

## Frontend Setup

### Prerequisites
- Node.js (v14 or higher)
- Vite

### Installation

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_STRIPE_PUBLIC_KEY
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Getting Stripe Keys

1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to "API Keys" section
3. Copy your publishable key and secret key
4. For webhook testing, use Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/webhook
```

## Usage

1. **Browse Products**: Navigate to the home page to see all available products
2. **Add to Cart**: Click "Add to Cart" button and select quantity
3. **View Cart**: Click the cart icon to view items
4. **Manage Cart**: Update quantities or remove items
5. **Checkout**: Click "Proceed to Checkout"
6. **Payment**: Enter test card details (e.g., 4242 4242 4242 4242)
7. **View Orders**: Click "Orders" to see transaction history

## Test Card Numbers

For testing Stripe payments:
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005

Use any future expiry date and any 3-digit CVC.

## Database Models

### Product
```javascript
{
  name: String,
  price: Number,
  description: String,
  image: String,
  quantity: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart
```javascript
{
  sessionId: String,
  items: [
    {
      productId: ObjectId,
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],
  totalPrice: Number
}
```

### Order
```javascript
{
  sessionId: String,
  items: Array,
  totalPrice: Number,
  status: String (pending, completed, failed, cancelled),
  stripePaymentId: String,
  stripeSessionId: String,
  customerEmail: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Stripe Webhook Events Handled

- `payment_intent.succeeded` - Update order status to completed
- `payment_intent.payment_failed` - Update order status to failed
- `charge.refunded` - Update order status to cancelled

## Features Implementation

### Frontend
- **React Context API** for cart state management
- **React Router** for navigation
- **Stripe React Elements** for payment forms
- **Axios** for API requests
- **Responsive CSS Grid** layout

### Backend
- **Express.js** for REST API
- **MongoDB** with Mongoose for data persistence
- **Stripe SDK** for payment processing
- **Session-based** cart management (no authentication needed)

## Development Notes

- Session IDs are generated and stored in localStorage
- Cart data is associated with session IDs
- Orders are created before payment processing
- Payment status is updated via Stripe webhooks
- Products are auto-seeded on first server start

## Troubleshooting

### Cart not persisting?
- Check if localStorage is enabled in your browser
- Clear browser cache and localStorage

### Payment failing?
- Ensure Stripe keys are correct in `.env`
- Check Stripe webhook configuration
- Verify MongoDB connection

### Products not loading?
- Check MongoDB connection
- Verify MONGO_URI in `.env`
- Check backend server logs

## Production Deployment

Before deploying to production:
1. Use Stripe live keys (not test keys)
2. Configure CORS properly
3. Use environment variables securely
4. Set up HTTPS
5. Enable MongoDB authentication
6. Configure webhook for live events
7. Set NODE_ENV to production

## License

This project is developed for task round
