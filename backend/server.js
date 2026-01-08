const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Raw body for Stripe webhook (only for webhook endpoint)
app.use('/api/webhook', express.raw({ type: 'application/octet-stream' }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/checkout', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
    // Seed products if empty
    seedProducts();
  })
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { handleWebhook } = require('./config/webhook');

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.post('/api/webhook', handleWebhook);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Seed products function
const seedProducts = async () => {
  try {
    const Product = require('./models/Product');
    const count = await Product.countDocuments();

    if (count === 0) {
      const products = [
        {
          name: 'Wireless Headphones',
          price: 2499,
          description: 'High-quality wireless headphones with noise cancellation',
          image: 'https://m.media-amazon.com/images/I/61LJwFvVT5L._SX679_.jpg',
          quantity: 50,
        },
        {
          name: 'Smart Watch',
          price: 5999,
          description: 'Feature-rich smartwatch with health tracking and fitness modes',
          image: 'https://m.media-amazon.com/images/I/71VyJM3BRFL._SX679_.jpg',
          quantity: 30,
        },
        {
          name: 'USB-C Cable',
          price: 399,
          description: 'Durable USB-C charging cable, 1 meter length, fast charging',
          image: 'https://m.media-amazon.com/images/I/61qC6c3b+LL._SX679_.jpg',
          quantity: 100,
        },
        {
          name: 'Portable Speaker',
          price: 1499,
          description: 'Waterproof Bluetooth speaker with 20-hour battery life',
          image: 'https://m.media-amazon.com/images/I/71Vx+j+aO8L._SX679_.jpg',
          quantity: 40,
        },
        {
          name: 'Phone Case',
          price: 599,
          description: 'Protective phone case with premium silicone material',
          image: 'https://m.media-amazon.com/images/I/61qC7XptY5L._SX679_.jpg',
          quantity: 80,
        },
        {
          name: 'Screen Protector',
          price: 299,
          description: 'Tempered glass screen protector with easy installation',
          image: 'https://m.media-amazon.com/images/I/61qC7XptY5L._SX679_.jpg',
          quantity: 120,
        },
        {
          name: 'Wireless Charger',
          price: 799,
          description: 'Fast wireless charging pad, compatible with all phones',
          image: 'https://m.media-amazon.com/images/I/71tIrUtf0jL._SX679_.jpg',
          quantity: 60,
        },
        {
          name: 'Phone Tripod',
          price: 899,
          description: 'Adjustable aluminum phone tripod for content creation',
          image: 'https://m.media-amazon.com/images/I/71pJPfvAbqL._SX679_.jpg',
          quantity: 45,
        },
      ];

      await Product.insertMany(products);
      console.log('Products seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
