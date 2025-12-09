import express from 'express';
import { register, login, logout, updateAddress, getShippingAddress } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.put('/address', authenticateToken, updateAddress);
router.get('/address', authenticateToken, getShippingAddress);

export default router;