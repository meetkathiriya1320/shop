import express from 'express';
import {
    addRating,
    updateRating,
    deleteRating,
    getCategoryRatings,
    getUserRatings
} from '../controllers/ratingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/ratings - Add a new rating (protected)
router.post('/', authenticateToken, addRating);

// PUT /api/ratings/:id - Update a rating (protected)
router.put('/:id', authenticateToken, updateRating);

// DELETE /api/ratings/:id - Delete a rating (protected)
router.delete('/:id', authenticateToken, deleteRating);

// GET /api/ratings/category/:categoryId - Get all ratings for a category (protected)
router.get('/category/:categoryId', authenticateToken, getCategoryRatings);

// GET /api/ratings/user/:categoryId - Get user's ratings for a category (protected)
router.get('/user/:categoryId', authenticateToken, getUserRatings);

export default router;