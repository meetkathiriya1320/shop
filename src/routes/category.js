import express from 'express';
import multiparty from 'multiparty';
import { addCategory, getCategories, getCategoriesGrouped, getCategoryNames, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to parse multipart form data with file uploads
const parseFormData = (req, res, next) => {
  const form = new multiparty.Form({
    uploadDir: 'public/uploads', // Directory to save uploaded files
    maxFilesSize: 10 * 1024 * 1024, // 10MB max file size
    maxFields: 20, // Max number of fields
    maxFieldsSize: 1024 * 1024 // 1MB max field size
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err);
    }

    // Convert multiparty fields (arrays) to the format we expect
    req.body = {};
    for (const [key, values] of Object.entries(fields)) {
      if (values.length === 1) {
        req.body[key] = values[0];
      } else {
        req.body[key] = values;
      }
    }

    // Store uploaded files info
    req.files = files;
    next();
  });
};

// POST /api/categories - Add a new category (protected)
router.post('/', parseFormData, authenticateToken, addCategory);

// GET /api/categories - Get categories with optional filters (protected)
router.get('/', authenticateToken, getCategories);

// GET /api/categories/grouped - Get categories grouped by category name (protected)
router.get('/grouped', getCategoriesGrouped);

// POST /api/categories/names - Get all categories with matching name (protected)
router.post('/names', authenticateToken, getCategoryNames);

// PUT /api/categories/:id - Update a category (protected)
router.put('/:id', parseFormData, authenticateToken, updateCategory);

// DELETE /api/categories/:id - Delete a category (protected)
router.delete('/:id', authenticateToken, deleteCategory);

export default router;