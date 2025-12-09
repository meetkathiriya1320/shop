import pool from '../config/database.js';

class CartItem {
    constructor(id, userId, categoryId, quantity, createdAt, updatedAt) {
        this.id = id;
        this.userId = userId;
        this.categoryId = categoryId;
        this.quantity = quantity;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Static method to find cart item by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM cart_items WHERE id = ?', [id]);
            if (rows.length === 0) return null;
            const row = rows[0];
            return new CartItem(row.id, row.user_id, row.category_id, row.quantity, row.created_at, row.updated_at);
        } catch (error) {
            console.error('Error finding cart item by ID:', error);
            throw error;
        }
    }

    // Static method to find cart item by user and category
    static async findByUserAndCategory(userId, categoryId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM cart_items WHERE user_id = ? AND category_id = ?',
                [userId, categoryId]
            );
            if (rows.length === 0) return null;
            const row = rows[0];
            return new CartItem(row.id, row.user_id, row.category_id, row.quantity, row.created_at, row.updated_at);
        } catch (error) {
            console.error('Error finding cart item by user and category:', error);
            throw error;
        }
    }

    // Static method to add item to cart
    static async addToCart(userId, categoryId, quantity = 1) {
        try {
            // First, check if the category exists
            const [categoryRows] = await pool.execute('SELECT id FROM categories WHERE id = ?', [categoryId]);
            if (categoryRows.length === 0) {
                throw new Error('Category not found');
            }

            // Check if item already exists in cart
            const existingItem = await CartItem.findByUserAndCategory(userId, categoryId);

            if (existingItem) {
                // Update quantity
                const newQuantity = existingItem.quantity + quantity;
                await pool.execute(
                    'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
                    [newQuantity, existingItem.id]
                );
                return existingItem.id;
            } else {
                // Insert new item
                const [result] = await pool.execute(
                    'INSERT INTO cart_items (user_id, category_id, quantity, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                    [userId, categoryId, quantity]
                );
                return result.insertId;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    // Static method to update cart item quantity
    static async updateQuantity(id, quantity) {
        try {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or negative
                return await CartItem.delete(id);
            }

            const [result] = await pool.execute(
                'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
                [quantity, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            throw error;
        }
    }

    // Static method to update quantity by user and category
    static async updateQuantityByUserAndCategory(userId, categoryId, quantity) {
        try {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or negative
                return await CartItem.deleteByUserAndCategory(userId, categoryId);
            }

            const [result] = await pool.execute(
                'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE user_id = ? AND category_id = ?',
                [quantity, userId, categoryId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating cart item quantity by user and category:', error);
            throw error;
        }
    }

    // Static method to remove item from cart
    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM cart_items WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting cart item:', error);
            throw error;
        }
    }

    // Static method to remove item by user and category
    static async deleteByUserAndCategory(userId, categoryId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM cart_items WHERE user_id = ? AND category_id = ?',
                [userId, categoryId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting cart item by user and category:', error);
            throw error;
        }
    }

    // Static method to get user's cart
    static async getUserCart(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT ci.*,
                        c.name, c.price, c.size, c.material, c.color,
                        GROUP_CONCAT(cimg.image_url ORDER BY cimg.created_at SEPARATOR ',') as images
                 FROM cart_items ci
                 JOIN categories c ON ci.category_id = c.id
                 LEFT JOIN category_images cimg ON c.id = cimg.category_id
                 WHERE ci.user_id = ?
                 GROUP BY ci.id, c.id
                 ORDER BY ci.created_at DESC`,
                [userId]
            );

            const cartItems = rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                categoryId: row.category_id,
                quantity: row.quantity,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                category: {
                    id: row.category_id,
                    name: row.name,
                    price: row.price,
                    size: row.size,
                    material: row.material,
                    color: row.color,
                    images: row.images ? row.images.split(',') : []
                },
                subtotal: row.price * row.quantity
            }));

            // Calculate total
            const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                items: cartItems,
                total,
                totalItems
            };
        } catch (error) {
            console.error('Error getting user cart:', error);
            throw error;
        }
    }

    // Static method to clear user's cart
    static async clearUserCart(userId) {
        try {
            const [result] = await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);
            return result.affectedRows;
        } catch (error) {
            console.error('Error clearing user cart:', error);
            throw error;
        }
    }

    // Static method to get cart item count for user
    static async getCartItemCount(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT SUM(quantity) as total_items FROM cart_items WHERE user_id = ?',
                [userId]
            );
            return rows[0].total_items || 0;
        } catch (error) {
            console.error('Error getting cart item count:', error);
            throw error;
        }
    }

    // Static method to find all cart items by user ID
    static async findByUserId(userId) {
        try {
            const [rows] = await pool.execute('SELECT * FROM cart_items WHERE user_id = ?', [userId]);
            return rows.map(row => new CartItem(row.id, row.user_id, row.category_id, row.quantity, row.created_at, row.updated_at));
        } catch (error) {
            console.error('Error finding cart items by user ID:', error);
            throw error;
        }
    }

    // Static method to remove item by user and category
    static async remove(userId, categoryId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM cart_items WHERE user_id = ? AND category_id = ?',
                [userId, categoryId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error removing cart item:', error);
            throw error;
        }
    }

    // Static method to create the cart_items table if it doesn't exist
    static async createTableIfNotExists() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS cart_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    category_id INT NOT NULL,
                    quantity INT NOT NULL DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_user_category_cart (user_id, category_id)
                )
            `;
            await pool.execute(createTableQuery);
            console.log('Cart items table created or updated.');
        } catch (error) {
            console.error('Error creating/updating cart items table:', error);
            throw error;
        }
    }
}

// Automatically create the table upon model import
CartItem.createTableIfNotExists();

export default CartItem;