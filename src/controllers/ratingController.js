import Rating from '../models/Rating.js';

export const addRating = async (req, res) => {
    try {
        const { categoryId, rating, review } = req.body;
        const userId = req.user.id; // From auth middleware

        if (!categoryId || !rating) {
            return res.status(400).json({ message: 'Category ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // // Check if user already rated this category
        // const existingRating = await Rating.findByUserAndCategory(userId, categoryId);
        // if (existingRating) {
        //     return res.status(400).json({ message: 'You have already rated this category' });
        // }

        const ratingId = await Rating.create(userId, categoryId, rating, review || null);

        res.status(201).json({
            message: 'Rating added successfully',
            ratingId,
            rating: {
                id: ratingId,
                userId,
                categoryId,
                rating,
                review
            }
        });
    } catch (error) {
        console.error('Add rating error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;
        const userId = req.user.id;

        if (!rating) {
            return res.status(400).json({ message: 'Rating is required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if rating exists and belongs to user
        const existingRating = await Rating.findById(id);
        if (!existingRating) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        if (existingRating.userId !== userId) {
            return res.status(403).json({ message: 'You can only update your own ratings' });
        }

        const updated = await Rating.update(id, rating, review || null);

        if (!updated) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        res.json({ message: 'Rating updated successfully' });
    } catch (error) {
        console.error('Update rating error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteRating = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if rating exists and belongs to user
        const existingRating = await Rating.findById(id);
        if (!existingRating) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        if (existingRating.userId !== userId) {
            return res.status(403).json({ message: 'You can only delete your own ratings' });
        }

        const deleted = await Rating.delete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
        console.error('Delete rating error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCategoryRatings = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const ratings = await Rating.getByCategoryId(categoryId);
        const stats = await Rating.getAverageRating(categoryId);

        res.json({
            ratings,
            statistics: stats
        });
    } catch (error) {
        console.error('Get category ratings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserRatings = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const userId = req.user.id;

        const ratings = await Rating.getByUserAndCategory(userId, categoryId);
        const stats = await Rating.getAverageRating(categoryId);

        res.json({
            ratings: ratings.map(rating => ({
                id: rating.id,
                userId: rating.userId,
                userName: rating.userName,
                categoryId: rating.categoryId,
                rating: rating.rating,
                review: rating.review,
                createdAt: rating.createdAt
            })),
            statistics: stats
        });
    } catch (error) {
        console.error('Get user ratings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};