import pool from '../config/database.js';

class Order {
    constructor(id, userId, totalAmount, status, paymentMethod, paymentStatus, shippingAddressStreet, shippingAddressCity, shippingAddressState, shippingAddressZip, shippingAddressCountry, createdAt, updatedAt) {
        this.id = id;
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.shippingAddressStreet = shippingAddressStreet;
        this.shippingAddressCity = shippingAddressCity;
        this.shippingAddressState = shippingAddressState;
        this.shippingAddressZip = shippingAddressZip;
        this.shippingAddressCountry = shippingAddressCountry;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Static method to create a new order
    static async create(userId, totalAmount, paymentMethod, shippingAddressStreet, shippingAddressCity, shippingAddressState, shippingAddressZip, shippingAddressCountry) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO orders (user_id, total_amount, payment_method, shipping_address_street, shipping_address_city, shipping_address_state, shipping_address_zip, shipping_address_country, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [userId, totalAmount, paymentMethod, shippingAddressStreet, shippingAddressCity, shippingAddressState, shippingAddressZip, shippingAddressCountry]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    // Static method to find order by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
            if (rows.length === 0) return null;
            const row = rows[0];
            return new Order(row.id, row.user_id, row.total_amount, row.status, row.payment_method, row.payment_status, row.shipping_address_street, row.shipping_address_city, row.shipping_address_state, row.shipping_address_zip, row.shipping_address_country, row.created_at, row.updated_at);
        } catch (error) {
            console.error('Error finding order by ID:', error);
            throw error;
        }
    }

    // Static method to find orders by user ID
    static async findByUserId(userId) {
        try {
            const [rows] = await pool.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
            return rows.map(row => new Order(row.id, row.user_id, row.total_amount, row.status, row.payment_method, row.payment_status, row.shipping_address_street, row.shipping_address_city, row.shipping_address_state, row.shipping_address_zip, row.shipping_address_country, row.created_at, row.updated_at));
        } catch (error) {
            console.error('Error finding orders by user ID:', error);
            throw error;
        }
    }

    // Static method to update order status
    static async updateStatus(id, status) {
        try {
            await pool.execute('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // Static method to update payment status
    static async updatePaymentStatus(id, paymentStatus) {
        try {
            await pool.execute('UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?', [paymentStatus, id]);
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }

    // Static method to create the orders table if it doesn't exist
    static async createTableIfNotExists() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS orders (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    total_amount DECIMAL(10,2) NOT NULL,
                    status VARCHAR(50) DEFAULT 'pending',
                    payment_method VARCHAR(50),
                    payment_status VARCHAR(50) DEFAULT 'pending',
                    shipping_address_street VARCHAR(255),
                    shipping_address_city VARCHAR(100),
                    shipping_address_state VARCHAR(100),
                    shipping_address_zip VARCHAR(20),
                    shipping_address_country VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;
            await pool.execute(createTableQuery);
            console.log('Orders table created or updated.');
        } catch (error) {
            console.error('Error creating/updating orders table:', error);
            throw error;
        }
    }
}

// Automatically create the table upon model import
Order.createTableIfNotExists();

export default Order;