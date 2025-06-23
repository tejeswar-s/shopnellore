import express from 'express';
import { addReview, getProductReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add a review (protected)
router.post('/:productId', protect, addReview);
// Get all reviews for a product (public)
router.get('/:productId', getProductReviews);

export default router; 