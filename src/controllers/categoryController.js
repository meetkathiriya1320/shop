import Category from '../models/Category.js';
import pool from '../config/database.js';

export const addCategory = async (req, res) => {
    try {
        const { name, price, sizes, size, material, color, description, images } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        // Handle images - can be uploaded files or URLs
        let imagesArray = [];

        // Check for uploaded files first
        if (req.files && req.files.images) {
            const uploadedImages = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            imagesArray = uploadedImages.map(file => `/uploads/${file.path.split('\\').pop() || file.path.split('/').pop()}`);
        }

        // Also check for image URLs in form fields (for backward compatibility)
        if (images) {
            if (Array.isArray(images)) {
                // Multiple images fields parsed as array
                const urlImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
                imagesArray = imagesArray.concat(urlImages);
            } else if (typeof images === 'string' && images.trim() !== '') {
                // Single image field
                imagesArray.push(images.trim());
            }
        }

        // Handle sizes - check both 'sizes' and 'size' fields for comma-separated values
        let sizeInput = sizes || size; // Check both sizes and size fields

        if (sizeInput && typeof sizeInput === 'string' && sizeInput.trim() !== '') {
            const sizeArray = sizeInput.split(',').map(s => s.trim()).filter(s => s !== '');
            const categoryIds = [];

            for (const sizeValue of sizeArray) {
                if (sizeValue) {
                    const categoryId = await Category.create(
                        name,
                        price,
                        sizeValue,
                        material || null,
                        color || null,
                        description || null,
                        imagesArray
                    );
                    categoryIds.push(categoryId);
                }
            }

            if (categoryIds.length === 0) {
                return res.status(400).json({ message: 'No valid sizes provided' });
            }

            res.status(201).json({
                message: 'Categories created successfully',
                categoryIds,
                sizesCreated: categoryIds.length
            });
        } else if (sizes && Array.isArray(sizes) && sizes.length > 0) {
            // Handle sizes as array (backward compatibility)
            const categoryIds = [];

            for (const sizeValue of sizes) {
                if (sizeValue && typeof sizeValue === 'string' && sizeValue.trim() !== '') {
                    const categoryId = await Category.create(
                        name,
                        price,
                        sizeValue.trim(),
                        material || null,
                        color || null,
                        description || null,
                        imagesArray
                    );
                    categoryIds.push(categoryId);
                }
            }

            if (categoryIds.length === 0) {
                return res.status(400).json({ message: 'No valid sizes provided' });
            }

            res.status(201).json({
                message: 'Categories created successfully',
                categoryIds,
                sizesCreated: categoryIds.length
            });
        } else {
            // Single category creation (backward compatibility)
            const categoryId = await Category.create(
                name,
                price,
                sizeInput || null, // Use sizeInput as single size if not array
                material || null,
                color || null,
                description || null,
                imagesArray
            );
            res.status(201).json({ message: 'Category created successfully', categoryId });
        }
    } catch (error) {
        console.error('Add category error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCategories = async (req, res) => {
    try {
        const { name, minPrice, maxPrice, size, material, color, limit = 10, offset = 0 } = req.query;

        let query = `
            SELECT c.*,
                   GROUP_CONCAT(ci.image_url ORDER BY ci.created_at SEPARATOR ',') as images
            FROM categories c
            LEFT JOIN category_images ci ON c.id = ci.category_id
            WHERE 1=1
            GROUP BY c.id
        `;
        let params = [];

        // Add filters
        if (name) {
            query += ' AND name LIKE ?';
            params.push(`%${name}%`);
        }

        if (minPrice) {
            query += ' AND price >= ?';
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            query += ' AND price <= ?';
            params.push(parseFloat(maxPrice));
        }

        if (size) {
            query += ' AND size = ?';
            params.push(size);
        }

        if (material) {
            query += ' AND material = ?';
            params.push(material);
        }

        if (color) {
            query += ' AND color = ?';
            params.push(color);
        }

        // Add pagination
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.execute(query, params);

        // Process rows to convert images string to array
        const processedRows = rows.map(row => ({
            ...row,
            images: row.images ? row.images.split(',') : []
        }));

        // Get total count for pagination info
        let countQuery = 'SELECT COUNT(DISTINCT c.id) as total FROM categories c LEFT JOIN category_images ci ON c.id = ci.category_id WHERE 1=1';
        let countParams = [];

        if (name) {
            countQuery += ' AND name LIKE ?';
            countParams.push(`%${name}%`);
        }

        if (minPrice) {
            countQuery += ' AND price >= ?';
            countParams.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            countQuery += ' AND price <= ?';
            countParams.push(parseFloat(maxPrice));
        }

        if (size) {
            countQuery += ' AND size = ?';
            countParams.push(size);
        }

        if (material) {
            countQuery += ' AND material = ?';
            countParams.push(material);
        }

        if (color) {
            countQuery += ' AND color = ?';
            countParams.push(color);
        }

        const [countResult] = await pool.execute(countQuery, countParams);

        res.json({
            categories: processedRows,
            pagination: {
                total: countResult[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + processedRows.length < countResult[0].total
            }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCategoriesGrouped = async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.name, c.price, c.description,
                   GROUP_CONCAT(ci.image_url ORDER BY ci.created_at SEPARATOR ',') as images
            FROM categories c
            LEFT JOIN category_images ci ON c.id = ci.category_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;

        const [rows] = await pool.execute(query);

        // Group by category (part before first hyphen)
        const grouped = {};

        rows.forEach(row => {
            const name = row.name;
            const category = name; // e.g., "tshirt" from "tshirt-1"
            const images = row.images ? row.images.split(',') : [];

            if (!grouped[category]) {
                grouped[category] = [];
            }

            grouped[category].push({
                id: row.id,
                name: name,
                price: row.price,
                description: row.description,
                images: images
            });
        });

        res.json(grouped);
    } catch (error) {
        console.error('Get categories grouped error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCategoryNames = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required in request body' });
        }

        const query = `
            SELECT c.*,
                   GROUP_CONCAT(ci.image_url ORDER BY ci.created_at SEPARATOR ',') as images
            FROM categories c
            LEFT JOIN category_images ci ON c.id = ci.category_id
            WHERE c.name = ?
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;

        const [rows] = await pool.execute(query, [name]);

        // Process rows to convert images string to array
        const processedRows = rows.map(row => ({
            ...row,
            images: row.images ? row.images.split(',') : []
        }));

        res.json({ categories: processedRows });
    } catch (error) {
        console.error('Get category names error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, size, material, color, description, images } = req.body;

        // Fetch existing category
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Prepare update data - only update fields that are provided
        const updateData = {
            name: name !== undefined ? name : existingCategory.name,
            price: price !== undefined ? price : existingCategory.price,
            size: size !== undefined ? size : existingCategory.size,
            material: material !== undefined ? material : existingCategory.material,
            color: color !== undefined ? color : existingCategory.color,
            description: description !== undefined ? description : existingCategory.description,
            images: existingCategory.images // Start with existing images
        };

        // Handle images only if provided
        if (images !== undefined || (req.files && req.files.images)) {
            let imagesArray = [];

            // Check for uploaded files first
            if (req.files && req.files.images) {
                const uploadedImages = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
                imagesArray = uploadedImages.map(file => `/uploads/${file.path.split('\\').pop() || file.path.split('/').pop()}`);
            }

            // Also check for image URLs in form fields
            if (images) {
                if (Array.isArray(images)) {
                    // Multiple images fields parsed as array
                    const urlImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
                    imagesArray = imagesArray.concat(urlImages);
                } else if (typeof images === 'string' && images.trim() !== '') {
                    // Single image field
                    imagesArray.push(images.trim());
                }
            }

            updateData.images = imagesArray;
        }

        // Validate required fields
        if (!updateData.name || updateData.price === undefined) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        await Category.update(id, updateData.name, updateData.price, updateData.size, updateData.material, updateData.color, updateData.description, updateData.images);

        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Category.delete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};