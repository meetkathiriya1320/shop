import pool from '../config/database.js';

class Category {
    constructor(id, name, price, size, material, color, description, images, createdAt) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.size = size;
        this.material = material;
        this.color = color;
        this.description = description;
        this.images = images || [];
        this.createdAt = createdAt;
    }

    // Static method to find category by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
            if (rows.length === 0) return null;
            const row = rows[0];

            // Fetch images for this category
            const [imageRows] = await pool.execute('SELECT image_url FROM category_images WHERE category_id = ? ORDER BY created_at', [id]);
            const images = imageRows.map(img => img.image_url);

            return new Category(row.id, row.name, row.price, row.size, row.material, row.color, row.description, images, row.created_at);
        } catch (error) {
            console.error('Error finding category by ID:', error);
            throw error;
        }
    }

    // Static method to create a new category
    static async create(name, price, size, material, color, description, images) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO categories (name, price, size, material, color, description, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [name, price, size, material, color, description]
            );
            const categoryId = result.insertId;

            // Insert images if provided
            if (images && images.length > 0) {
                const imageInserts = images.map(img => [categoryId, img]);
                const placeholders = imageInserts.map(() => '(?, ?)').join(', ');
                const values = imageInserts.flat();
                await pool.execute(`INSERT INTO category_images (category_id, image_url) VALUES ${placeholders}`, values);
            }

            return categoryId;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    // Static method to update a category
    static async update(id, name, price, size, material, color, description, images) {
        try {
            const [result] = await pool.execute(
                'UPDATE categories SET name = ?, price = ?, size = ?, material = ?, color = ?, description = ? WHERE id = ?',
                [name, price, size, material, color, description, id]
            );

            if (result.affectedRows === 0) {
                throw new Error('Category not found');
            }

            // Delete existing images and insert new ones
            await pool.execute('DELETE FROM category_images WHERE category_id = ?', [id]);

            if (images && images.length > 0) {
                const imageInserts = images.map(img => [id, img]);
                const placeholders = imageInserts.map(() => '(?, ?)').join(', ');
                const values = imageInserts.flat();
                await pool.execute(`INSERT INTO category_images (category_id, image_url) VALUES ${placeholders}`, values);
            }

            return true;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    // Static method to delete a category
    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    // Static method to create the categories table if it doesn't exist (for migration)
    static async createTableIfNotExists() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(255) NOT NULL,
                    price REAL NOT NULL,
                    size VARCHAR(50),
                    material VARCHAR(100),
                    color VARCHAR(50),
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await pool.execute(createTableQuery);

            // Create category_images table for multiple images
            const createImagesTableQuery = `
                CREATE TABLE IF NOT EXISTS category_images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category_id INTEGER NOT NULL,
                    image_url VARCHAR(500) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await pool.execute(createImagesTableQuery);

            // Ensure description column exists (for backward compatibility)
            try {
                await pool.execute('ALTER TABLE categories ADD COLUMN description TEXT');
            } catch (alterError) {
                // Column might already exist, ignore error
                console.log('Description column check completed.');
            }

            console.log('Categories and category_images tables created or updated.');
        } catch (error) {
            console.error('Error creating/updating categories tables:', error);
            throw error;
        }
    }
}

// Automatically create the table upon model import (migration)
Category.createTableIfNotExists().catch(err => {
    console.error('Failed to create categories table:', err);
});

export default Category;