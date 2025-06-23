import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user.wishlist);
};

// @desc    Add a product to the wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const user = await User.findById(req.user._id);
  if (user.wishlist.includes(productId)) {
    return res.status(400).json({ message: 'Product already in wishlist' });
  }

  user.wishlist.push(productId);
  await user.save();

  const populatedUser = await User.findById(req.user._id).populate('wishlist');
  res.status(200).json(populatedUser.wishlist);
};

// @desc    Remove a product from the wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  const populatedUser = await User.findById(req.user._id).populate('wishlist');
  res.status(200).json(populatedUser.wishlist);
}; 