import express from 'express';
import {
    addToCart,
    updateCartItem,
    updateCartItemByCategory,
    removeFromCart,
    removeFromCartByCategory,
    getCart,
    clearCart,
    getCartCount,
    checkoutCart
} from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/cart - Add item to cart (protected)
router.post('/', authenticateToken, addToCart);

// POST /api/cart/add/:categoryId - Add item to cart with URL params (protected)
router.post('/add/:categoryId', authenticateToken, addToCart);

// POST /api/cart/add/:categoryId/:quantity - Add item to cart with URL params including quantity (protected)
router.post('/add/:categoryId/:quantity', authenticateToken, addToCart);

// PUT /api/cart/:id - Update cart item quantity by cart item ID (protected)
router.put('/:id', authenticateToken, updateCartItem);

// PUT /api/cart/update/:id/:quantity - Update cart item with URL params (protected)
router.put('/update/:id/:quantity', authenticateToken, updateCartItem);

// PUT /api/cart/category/:categoryId - Update cart item quantity by category ID (protected)
router.put('/category/:categoryId', authenticateToken, updateCartItemByCategory);

// PUT /api/cart/category/:categoryId/:quantity - Update cart item by category with URL params (protected)
router.put('/category/:categoryId/:quantity', authenticateToken, updateCartItemByCategory);

// DELETE /api/cart/:id - Remove item from cart by cart item ID (protected)
router.delete('/:id', authenticateToken, removeFromCart);

// DELETE /api/cart/remove/:id - Remove item from cart with URL params (protected)
router.delete('/remove/:id', authenticateToken, removeFromCart);

// DELETE /api/cart/category/:categoryId - Remove item from cart by category ID (protected)
router.delete('/category/:categoryId', authenticateToken, removeFromCartByCategory);

// DELETE /api/cart/category/remove/:categoryId - Remove item by category with URL params (protected)
router.delete('/category/remove/:categoryId', authenticateToken, removeFromCartByCategory);

// GET /api/cart - Get user's cart (protected)
router.get('/', authenticateToken, getCart);

// DELETE /api/cart - Clear entire cart (protected)
router.delete('/', authenticateToken, clearCart);

// GET /api/cart/count - Get cart item count (protected)
router.get('/count', authenticateToken, getCartCount);

// POST /api/cart/checkout - Checkout cart and create order (protected)
router.post('/checkout', authenticateToken, checkoutCart);

export default router;