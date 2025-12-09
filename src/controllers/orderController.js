import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import CartItem from '../models/CartItem.js';
import pool from '../config/database.js';

export const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { paymentMethod, shippingAddressStreet, shippingAddressCity, shippingAddressState, shippingAddressZip, shippingAddressCountry } = req.body;

        // Get cart items for the user
        const cartItems = await CartItem.findByUserId(userId);
        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total amount
        let totalAmount = 0;
        const categoryPrices = new Map(); // Cache category prices to avoid multiple DB calls

        for (const item of cartItems) {
            let price;
            if (categoryPrices.has(item.categoryId)) {
                price = categoryPrices.get(item.categoryId);
            } else {
                const [categoryRows] = await pool.execute('SELECT price FROM categories WHERE id = ?', [item.categoryId]);
                if (categoryRows.length === 0) {
                    return res.status(400).json({ message: `Category ${item.categoryId} not found` });
                }
                price = categoryRows[0].price;
                categoryPrices.set(item.categoryId, price);
            }
            totalAmount += price * item.quantity;
        }

        // Create order
        const orderId = await Order.create(userId, totalAmount, paymentMethod, shippingAddressStreet, shippingAddressCity, shippingAddressState, shippingAddressZip, shippingAddressCountry);

        // Create order items and clear cart
        for (const item of cartItems) {
            const price = categoryPrices.get(item.categoryId);
            await OrderItem.create(orderId, item.categoryId, item.quantity, price);
            await CartItem.remove(userId, item.categoryId);
        }

        // Get the created order
        const order = await Order.findById(orderId);

        res.status(201).json({
            message: 'Order placed successfully',
            order: {
                id: order.id,
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                shippingAddressStreet: order.shippingAddressStreet,
                shippingAddressCity: order.shippingAddressCity,
                shippingAddressState: order.shippingAddressState,
                shippingAddressZip: order.shippingAddressZip,
                shippingAddressCountry: order.shippingAddressCountry,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ message: 'Failed to place order' });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findByUserId(userId);

        // Get order items for each order with category details and images
        // Use a single query to get all category details for better performance
        const orderIds = orders.map(order => order.id);
        const categoryIds = [];

        // First, get all order items for all orders
        const allOrderItems = [];
        for (const orderId of orderIds) {
            const items = await OrderItem.findByOrderId(orderId);
            allOrderItems.push(...items.map(item => ({ ...item, orderId })));
            categoryIds.push(...items.map(item => item.categoryId));
        }

        // Get all category details in one query
        const uniqueCategoryIds = [...new Set(categoryIds)];
        const categoryDetails = new Map();

        if (uniqueCategoryIds.length > 0) {
            const placeholders = uniqueCategoryIds.map(() => '?').join(',');
            const [categoryRows] = await pool.execute(
                `SELECT c.*,
                        GROUP_CONCAT(cimg.image_url ORDER BY cimg.created_at SEPARATOR ',') as images
                 FROM categories c
                 LEFT JOIN category_images cimg ON c.id = cimg.category_id
                 WHERE c.id IN (${placeholders})
                 GROUP BY c.id`,
                uniqueCategoryIds
            );

            categoryRows.forEach(category => {
                categoryDetails.set(category.id, {
                    id: category.id,
                    name: category.name,
                    price: category.price,
                    size: category.size,
                    material: category.material,
                    color: category.color,
                    description: category.description,
                    images: category.images ? category.images.split(',') : []
                });
            });
        }

        // Group items by order
        const ordersWithItems = orders.map(order => {
            const orderItems = allOrderItems.filter(item => item.orderId === order.id);
            const itemsWithDetails = orderItems.map(item => ({
                id: item.id,
                categoryId: item.categoryId,
                quantity: item.quantity,
                price: item.price,
                category: categoryDetails.get(item.categoryId) || null
            }));

            return {
                id: order.id,
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                shippingAddressStreet: order.shippingAddressStreet,
                shippingAddressCity: order.shippingAddressCity,
                shippingAddressState: order.shippingAddressState,
                shippingAddressZip: order.shippingAddressZip,
                shippingAddressCountry: order.shippingAddressCountry,
                createdAt: order.createdAt,
                items: itemsWithDetails
            };
        });

        res.json({ orders: ordersWithItems });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ message: 'Failed to get orders' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await Order.findById(id);
        if (!order || order.userId !== userId) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const items = await OrderItem.findByOrderId(id);

        // Get category details with images for each item (batch query for better performance)
        const categoryIds = items.map(item => item.categoryId);
        const categoryDetails = new Map();

        if (categoryIds.length > 0) {
            const placeholders = categoryIds.map(() => '?').join(',');
            const [categoryRows] = await pool.execute(
                `SELECT c.*,
                        GROUP_CONCAT(cimg.image_url ORDER BY cimg.created_at SEPARATOR ',') as images
                 FROM categories c
                 LEFT JOIN category_images cimg ON c.id = cimg.category_id
                 WHERE c.id IN (${placeholders})
                 GROUP BY c.id`,
                categoryIds
            );

            categoryRows.forEach(category => {
                categoryDetails.set(category.id, {
                    id: category.id,
                    name: category.name,
                    price: category.price,
                    size: category.size,
                    material: category.material,
                    color: category.color,
                    description: category.description,
                    images: category.images ? category.images.split(',') : []
                });
            });
        }

        const itemsWithDetails = items.map(item => ({
            id: item.id,
            categoryId: item.categoryId,
            quantity: item.quantity,
            price: item.price,
            category: categoryDetails.get(item.categoryId) || null
        }));

        res.json({
            order: {
                id: order.id,
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                shippingAddressStreet: order.shippingAddressStreet,
                shippingAddressCity: order.shippingAddressCity,
                shippingAddressState: order.shippingAddressState,
                shippingAddressZip: order.shippingAddressZip,
                shippingAddressCountry: order.shippingAddressCountry,
                createdAt: order.createdAt,
                items: itemsWithDetails
            }
        });
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({ message: 'Failed to get order' });
    }
};

export const processPayment = async (req, res) => {
    try {
        const { orderId, paymentDetails } = req.body;
        const userId = req.user.id;

        // Verify order belongs to user
        const order = await Order.findById(orderId);
        if (!order || order.userId !== userId) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.paymentStatus === 'completed') {
            return res.status(400).json({ message: 'Payment already completed' });
        }

        // Here you would integrate with a payment gateway like Stripe, PayPal, etc.
        // For now, we'll simulate payment processing
        const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

        if (paymentSuccess) {
            await Order.updatePaymentStatus(orderId, 'completed');
            await Order.updateStatus(orderId, 'confirmed');

            res.json({
                message: 'Payment processed successfully',
                orderId,
                paymentStatus: 'completed',
                orderStatus: 'confirmed'
            });
        } else {
            await Order.updatePaymentStatus(orderId, 'failed');
            res.status(400).json({
                message: 'Payment failed',
                orderId,
                paymentStatus: 'failed'
            });
        }
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({ message: 'Payment processing failed' });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify order belongs to user
        const order = await Order.findById(id);
        if (!order || order.userId !== userId) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order can be cancelled (only pending orders can be cancelled)
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
        }

        // Update order status to cancelled
        await Order.updateStatus(id, 'cancelled');

        res.json({
            message: 'Order cancelled successfully',
            orderId: id,
            status: 'cancelled'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Failed to cancel order' });
    }
};