import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Payment screen route - serves the payment page
router.get('/screen/:orderId', authenticateToken, (req, res) => {
    const { orderId } = req.params;
    // In a real application, you would serve an HTML page or redirect to a payment gateway
    // For now, we'll send a simple response
    res.json({
        message: 'Payment screen for order',
        orderId,
        paymentUrl: `/api/payment/process/${orderId}`, // Example payment processing URL
        instructions: 'Use the payment processing endpoint to complete payment'
    });
});

// Payment success callback
router.get('/success/:orderId', authenticateToken, (req, res) => {
    const { orderId } = req.params;
    res.json({
        message: 'Payment successful',
        orderId,
        status: 'completed'
    });
});

// Payment failure callback
router.get('/failure/:orderId', authenticateToken, (req, res) => {
    const { orderId } = req.params;
    res.json({
        message: 'Payment failed',
        orderId,
        status: 'failed'
    });
});

export default router;