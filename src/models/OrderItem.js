import pool from '../config/database.js';

class OrderItem {
    constructor(id, orderId, categoryId, quantity, price, createdAt) {
        this.id = id;
        this.orderId = orderId;
        this.categoryId = categoryId;
        this.quantity = quantity;
        this.price = price;
        this.createdAt = createdAt;
    }

    // Static method to create a new order item
    static async create(orderId, categoryId, quantity, price) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO order_items (order_id, category_id, quantity, price, created_at) VALUES (?, ?, ?, ?, NOW())',
                [orderId, categoryId, quantity, price]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating order item:', error);
            throw error;
        }
    }

    // Static method to find order items by order ID
    static async findByOrderId(orderId) {
        try {
            const [rows] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
            return rows.map(row => new OrderItem(row.id, row.order_id, row.category_id, row.quantity, row.price, row.created_at));
        } catch (error) {
            console.error('Error finding order items by order ID:', error);
            throw error;
        }
    }

    // Static method to create the order_items table if it doesn't exist
    static async createTableIfNotExists() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS order_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NOT NULL,
                    category_id INT NOT NULL,
                    quantity INT NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
                )
            `;
            await pool.execute(createTableQuery);
            console.log('Order items table created or updated.');
        } catch (error) {
            console.error('Error creating/updating order_items table:', error);
            throw error;
        }
    }
}

// Automatically create the table upon model import
OrderItem.createTableIfNotExists();

export default OrderItem;