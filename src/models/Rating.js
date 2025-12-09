import pool from '../config/database.js';

class Rating {
    constructor(id, userId, categoryId, rating, review, createdAt) {
        this.id = id;
        this.userId = userId;
        this.categoryId = categoryId;
        this.rating = rating;
        this.review = review;
        this.createdAt = createdAt;
    }

    // Static method to find rating by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM ratings WHERE id = ?', [id]);
            if (rows.length === 0) return null;
            const row = rows[0];
            return new Rating(row.id, row.user_id, row.category_id, row.rating, row.review, row.created_at);
        } catch (error) {
            console.error('Error finding rating by ID:', error);
            throw error;
        }
    }

    // Static method to find ratings by user and category
    static async getByUserAndCategory(userId, categoryId) {
        try {
            const [rows] = await pool.execute(
                'SELECT r.*, u.name as user_name FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.user_id = ? AND r.category_id = ? ORDER BY r.created_at DESC',
                [userId, categoryId]
            );
            return rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                userName: row.user_name,
                categoryId: row.category_id,
                rating: row.rating,
                review: row.review,
                createdAt: row.created_at
            }));
        } catch (error) {
            console.error('Error finding ratings by user and category:', error);
            throw error;
        }
    }

    // Static method to create a new rating
    static async create(userId, categoryId, rating, review) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO ratings (user_id, category_id, rating, review, created_at) VALUES (?, ?, ?, ?, NOW())',
                [userId, categoryId, rating, review]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating rating:', error);
            throw error;
        }
    }

    // Static method to update a rating
    static async update(id, rating, review) {
        try {
            const [result] = await pool.execute(
                'UPDATE ratings SET rating = ?, review = ? WHERE id = ?',
                [rating, review, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating rating:', error);
            throw error;
        }
    }

    // Static method to delete a rating
    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM ratings WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting rating:', error);
            throw error;
        }
    }

    // Static method to get ratings for a category
    static async getByCategoryId(categoryId) {
        try {
            const [rows] = await pool.execute(
                `SELECT r.*, u.name as user_name
                 FROM ratings r
                 JOIN users u ON r.user_id = u.id
                 WHERE r.category_id = ?
                 ORDER BY r.created_at DESC`,
                [categoryId]
            );
            return rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                userName: row.user_name,
                categoryId: row.category_id,
                rating: row.rating,
                review: row.review,
                createdAt: row.created_at
            }));
        } catch (error) {
            console.error('Error getting ratings by category:', error);
            throw error;
        }
    }

    // Static method to get average rating for a category
    static async getAverageRating(categoryId) {
        try {
            const [rows] = await pool.execute(
                'SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE category_id = ?',
                [categoryId]
            );
            return {
                averageRating: rows[0].average_rating || 0,
                totalRatings: rows[0].total_ratings || 0
            };
        } catch (error) {
            console.error('Error getting average rating:', error);
            throw error;
        }
    }

    // Static method to create the ratings table if it doesn't exist
    static async createTableIfNotExists() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS ratings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    category_id INT NOT NULL,
                    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    review TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
                )
            `;
            await pool.execute(createTableQuery);
            // Try to drop the unique constraint if it exists to allow multiple ratings per user per category
            try {
                await pool.execute('ALTER TABLE ratings DROP INDEX IF EXISTS unique_user_category');
                console.log('Dropped unique constraint on ratings table.');
            } catch (dropError) {
                console.log('Unique constraint may not exist or could not be dropped:', dropError.message);
            }
            console.log('Ratings table created or updated.');
        } catch (error) {
            console.error('Error creating/updating ratings table:', error);
            throw error;
        }
    }
}

// Automatically create the table upon model import
Rating.createTableIfNotExists();

export default Rating;