import Review from '../models/Review.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// @desc    Add a review for a product
// @route   POST /api/reviews/:productId
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;
  const userId = req.user._id;

  // Prevent duplicate review
  const alreadyReviewed = await Review.findOne({ product: productId, user: userId });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = new Review({
    product: productId,
    user: userId,
    rating,
    comment,
  });
  await review.save();

  // Update product rating and numReviews
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / (numReviews || 1);
  await Product.findByIdAndUpdate(productId, {
    numReviews,
    rating: avgRating,
  });

  res.status(201).json(review);
});

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const reviews = await Review.find({ product: productId }).populate('user', 'name');
  res.json(reviews);
});

export { addReview, getProductReviews }; 