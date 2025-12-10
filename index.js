import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.js';
import categoryRoutes from './src/routes/category.js';
import ratingRoutes from './src/routes/rating.js';
import favoriteRoutes from './src/routes/favorite.js';
import cartRoutes from './src/routes/cart.js';
import orderRoutes from './src/routes/order.js';
import paymentRoutes from './src/routes/payment.js';
import { authenticateToken } from './src/middleware/auth.js';
import pool from './src/config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

// Serve static files from public folder
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Test database connection before starting server
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Connected to database: ${process.env.DB_NAME}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure MySQL server is running');
    console.log('   2. Check your .env database credentials');
    console.log('   3. Run: npm run setup-db');
    console.log('   4. Verify MySQL service is started\n');
    return false;
  }
}

// Start server with database check
async function startServer() {
  const dbConnected = await testDatabaseConnection();

  if (!dbConnected) {
    console.log('⚠️  Server starting without database connection...');
    console.log('   API endpoints requiring database will return errors.\n');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 API available at: http://localhost:${PORT}`);
    // console.log(`🔐 Authentication endpoints:`);
    // console.log(`   POST /api/auth/register`);
    // console.log(`   POST /api/auth/login`);
    // console.log(`   GET  /api/protected (requires token)\n`);
  });
}

startServer();

export default app;