import User from '../models/User.js';
import Product from '../models/Product.js';

// Get current user's cart
export const getCart = async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');
  res.json(user.cart);
};

// Add item to cart
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.user._id);
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.countInStock === 0) return res.status(400).json({ message: 'Product is out of stock' });
  if (product.countInStock < quantity) return res.status(400).json({ message: 'Not enough stock available' });
  const price = product.price;
  const existingItem = user.cart.find(item => item.product.toString() === productId);
  if (existingItem) {
    if (product.countInStock < existingItem.quantity + quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    existingItem.quantity += quantity;
  } else {
    user.cart.push({ product: productId, quantity, price });
  }
  await user.save();
  const populatedUser = await User.findById(req.user._id).populate('cart.product');
  res.json(populatedUser.cart);
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.user._id);
  const item = user.cart.find(item => item.product.toString() === productId);
  if (!item) return res.status(404).json({ message: 'Cart item not found' });

  if (quantity <= 0) {
    // If quantity is 0 or less, remove the item
    user.cart = user.cart.filter(cartItem => cartItem.product.toString() !== productId);
  } else {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.countInStock < quantity) {
      return res.status(400).json({ message: `Not enough stock. Only ${product.countInStock} available.` });
    }
    item.quantity = quantity;
  }
  
  await user.save();
  const populatedUser = await User.findById(req.user._id).populate('cart.product');
  res.json(populatedUser.cart);
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter(item => item.product.toString() !== productId);
  await user.save();
  const populatedUser = await User.findById(req.user._id).populate('cart.product');
  res.json(populatedUser.cart);
};

// Clear cart
export const clearCart = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();
  const populatedUser = await User.findById(req.user._id).populate('cart.product');
  res.json(populatedUser.cart);
}; 