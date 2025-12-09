import express from 'express';
import { placeOrder, getUserOrders, getOrderById, processPayment, cancelOrder } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Place a new order
router.post('/', authenticateToken, placeOrder);

// Get user's orders
router.get('/', authenticateToken, getUserOrders);

// Get specific order by ID
router.get('/:id', authenticateToken, getOrderById);

// Cancel order
router.put('/:id/cancel', authenticateToken, cancelOrder);

// Process payment for an order
router.post('/payment', authenticateToken, processPayment);

export default router;