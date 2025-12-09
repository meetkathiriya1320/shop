import express from 'express';
import {
    addFavorite,
    removeFavorite,
    getUserFavorites,
    checkFavoriteStatus,
    toggleFavorite
} from '../controllers/favoriteController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/favorites - Add a category to favorites (protected)
router.post('/', authenticateToken, addFavorite);

// DELETE /api/favorites/:categoryId - Remove a category from favorites (protected)
router.delete('/:categoryId', authenticateToken, removeFavorite);

// GET /api/favorites - Get user's favorites (protected)
router.get('/', authenticateToken, getUserFavorites);

// GET /api/favorites/check/:categoryId - Check if category is favorited by user (protected)
router.get('/check/:categoryId', authenticateToken, checkFavoriteStatus);

// POST /api/favorites/toggle - Toggle favorite status (protected)
router.post('/toggle', authenticateToken, toggleFavorite);

export default router;