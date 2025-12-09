import pool from '../config/database.js';

class Favorite {
    constructor(id, userId, categoryId, createdAt) {
        this.id = id;
        this.userId = userId;
        this.categoryId = categoryId;
        this.createdAt = createdAt;
    }

    // Static method to find favorite by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM favorites WHERE id = ?', [id]);
            if (rows.length === 0) return null;
            const row = rows[0];
            return new Favorite(row.id, row.user_id, row.category_id, row.created_at);
        } catch (error) {
            console.error('Error finding favorite by ID:', error);
            throw error;
        }
    }

    // Static method to find favorite by user and category
    static async findByUserAndCategory(userId, categoryId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM favorites WHERE user_id = ? AND category_id = ?',
                [userId, categoryId]
            );
            if (rows.length === 0) return null;
            const row = rows[0];
            return new Favorite(row.id, row.user_id, row.category_id, row.created_at);
        } catch (error) {
            console.error('Error finding favorite by user and category:', error);
            throw error;
        }
    }

    // Static method to create a new favorite
    static async create(userId, categoryId) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO favorites (user_id, category_id, created_at) VALUES (?, ?, NOW())',
                [userId, categoryId]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating favorite:', error);
            throw error;
        }
    }

    // Static method to delete a favorite
    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM favorites WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting favorite:', error);
            throw error;
        }
    }

    // Static method to delete favorite by user and category
    static async deleteByUserAndCategory(userId, categoryId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM favorites WHERE user_id = ? AND category_id = ?',
                [userId, categoryId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting favorite by user and category:', error);
            throw error;
        }
    }

    // Static method to get favorites by user
    static async getByUserId(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT f.*, c.name, c.price, c.size, c.material, c.color,
                        GROUP_CONCAT(ci.image_url ORDER BY ci.created_at SEPARATOR ',') as images
                 FROM favorites f
                 JOIN categories c ON f.category_id = c.id
                 LEFT JOIN category_images ci ON c.id = ci.category_id
                 WHERE f.user_id = ?
                 GROUP BY f.id, c.id
                 ORDER BY f.created_at DESC`,
                [userId]
            );

            return rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                categoryId: row.category_id,
                category: {
                    id: row.category_id,
                    name: row.name,
                    price: row.price,
                    size: row.size,
                    material: row.material,
                    color: row.color,
                    images: row.images ? row.images.split(',') : []
                },
                createdAt: row.created_at
            }));
        } catch (error) {
            console.error('Error getting favorites by user:', error);
            throw error;
        }
    }

    // Static method to check if category is favorited by user
    static async isFavorited(userId, categoryId) {
        try {
            const favorite = await Favorite.findByUserAndCategory(userId, categoryId);
            return favorite !== null;
        } catch (error) {
            console.error('Error checking if favorited:', error);
            throw error;
        }
    }

    // Static method to create the favorites table if it doesn't exist
    static async createTableIfNotExists() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS favorites (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    category_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_user_category_favorite (user_id, category_id)
                )
            `;
            await pool.execute(createTableQuery);
            console.log('Favorites table created or updated.');
        } catch (error) {
            console.error('Error creating/updating favorites table:', error);
            throw error;
        }
    }
}

// Automatically create the table upon model import
Favorite.createTableIfNotExists();

export default Favorite;