import CartItem from '../models/CartItem.js';

export const addToCart = async (req, res) => {
    try {
        // Check URL params first, then body
        let categoryId = req.params.categoryId || req.body.categoryId;
        const quantity = req.params.quantity ? parseInt(req.params.quantity) : (req.body.quantity || 1);
        const userId = req.user.id;

        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID or name is required' });
        }

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        // If categoryId is not a number, treat it as a category name and find the ID
        if (isNaN(categoryId)) {
            const pool = (await import('../config/database.js')).default;
            const [rows] = await pool.execute('SELECT id FROM categories WHERE name = ?', [categoryId]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }
            categoryId = rows[0].id;
        }

        const cartItemId = await CartItem.addToCart(userId, parseInt(categoryId), quantity);

        res.status(201).json({
            message: 'Item added to cart',
            cartItemId
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        if (error.message === 'Category not found') {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        // Check URL params first, then body
        const quantity = req.params.quantity !== undefined ? parseInt(req.params.quantity) : req.body.quantity;
        const userId = req.user.id;

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({ message: 'Valid quantity is required' });
        }

        // Check if cart item belongs to user
        const cartItem = await CartItem.findById(id);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        if (cartItem.userId !== userId) {
            return res.status(403).json({ message: 'You can only update your own cart items' });
        }

        const updated = await CartItem.updateQuantity(id, quantity);

        if (!updated) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.json({ message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated' });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCartItemByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        // Check URL params first, then body
        const quantity = req.params.quantity !== undefined ? parseInt(req.params.quantity) : req.body.quantity;
        const userId = req.user.id;

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({ message: 'Valid quantity is required' });
        }

        const updated = await CartItem.updateQuantityByUserAndCategory(userId, categoryId, quantity);

        if (!updated) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.json({ message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated' });
    } catch (error) {
        console.error('Update cart item by category error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if cart item belongs to user
        const cartItem = await CartItem.findById(id);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        if (cartItem.userId !== userId) {
            return res.status(403).json({ message: 'You can only remove your own cart items' });
        }

        const removed = await CartItem.delete(id);

        if (!removed) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFromCartByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const userId = req.user.id;

        const removed = await CartItem.deleteByUserAndCategory(userId, categoryId);

        if (!removed) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart by category error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await CartItem.getUserCart(userId);

        res.json(cart);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const removedCount = await CartItem.clearUserCart(userId);

        res.json({
            message: 'Cart cleared',
            itemsRemoved: removedCount
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCartCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await CartItem.getCartItemCount(userId);

        res.json({ count });
    } catch (error) {
        console.error('Get cart count error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkoutCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { paymentMethod, shippingAddressStreet, shippingAddressCity, shippingAddressState, shippingAddressZip, shippingAddressCountry } = req.body;

        // Get cart items
        const cartItems = await CartItem.findByUserId(userId);
        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total
        let totalAmount = 0;
        const pool = (await import('../config/database.js')).default;
        for (const item of cartItems) {
            const [categoryRows] = await pool.execute('SELECT price FROM categories WHERE id = ?', [item.categoryId]);
            if (categoryRows.length === 0) {
                return res.status(400).json({ message: `Category ${item.categoryId} not found` });
            }
            totalAmount += categoryRows[0].price * item.quantity;
        }

        // Create order
        const Order = (await import('../models/Order.js')).default;
        const orderId = await Order.create(userId, totalAmount, paymentMethod, shippingAddressStreet, shippingAddressCity, shippingAddressState, shippingAddressZip, shippingAddressCountry);

        // Create order items and clear cart
        const OrderItem = (await import('../models/OrderItem.js')).default;
        for (const item of cartItems) {
            const [categoryRows] = await pool.execute('SELECT price FROM categories WHERE id = ?', [item.categoryId]);
            await OrderItem.create(orderId, item.categoryId, item.quantity, categoryRows[0].price);
            await CartItem.remove(userId, item.categoryId);
        }

        res.status(201).json({
            message: 'Order placed successfully',
            orderId,
            totalAmount,
            paymentMethod,
            nextStep: 'Proceed to payment',
            paymentUrl: `/api/payment/screen/${orderId}`
        });
    } catch (error) {
        console.error('Checkout cart error:', error);
        res.status(500).json({ message: 'Failed to checkout' });
    }
};