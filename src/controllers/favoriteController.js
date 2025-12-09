import Favorite from '../models/Favorite.js';

export const addFavorite = async (req, res) => {
    try {
        const { categoryId } = req.body;
        const userId = req.user.id;

        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findByUserAndCategory(userId, categoryId);
        if (existingFavorite) {
            return res.status(400).json({ message: 'Category is already in favorites' });
        }

        const favoriteId = await Favorite.create(userId, categoryId);

        res.status(201).json({
            message: 'Category added to favorites',
            favoriteId,
            favorite: {
                id: favoriteId,
                userId,
                categoryId
            }
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFavorite = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const userId = req.user.id;

        const removed = await Favorite.deleteByUserAndCategory(userId, categoryId);

        if (!removed) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        res.json({ message: 'Category removed from favorites' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await Favorite.getByUserId(userId);

        res.json({
            favorites,
            total: favorites.length
        });
    } catch (error) {
        console.error('Get user favorites error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkFavoriteStatus = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const userId = req.user.id;

        const isFavorited = await Favorite.isFavorited(userId, categoryId);

        res.json({
            categoryId: parseInt(categoryId),
            isFavorited
        });
    } catch (error) {
        console.error('Check favorite status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const toggleFavorite = async (req, res) => {
    try {
        const { categoryId } = req.body;
        const userId = req.user.id;

        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }

        const existingFavorite = await Favorite.findByUserAndCategory(userId, categoryId);

        if (existingFavorite) {
            // Remove from favorites
            await Favorite.deleteByUserAndCategory(userId, categoryId);
            res.json({
                message: 'Category removed from favorites',
                action: 'removed',
                isFavorited: false
            });
        } else {
            // Add to favorites
            const favoriteId = await Favorite.create(userId, categoryId);
            res.status(201).json({
                message: 'Category added to favorites',
                action: 'added',
                favoriteId,
                isFavorited: true
            });
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};