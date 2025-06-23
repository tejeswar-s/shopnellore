import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    // Search functionality
    const keyword = req.query.keyword
        ? {
            $or: [
                {
                    name: {
                        $regex: req.query.keyword,
                        $options: 'i',
                    },
                },
                {
                    brand: {
                        $regex: req.query.keyword,
                        $options: 'i',
                    },
                },
                {
                    category: {
                        $regex: req.query.keyword,
                        $options: 'i',
                    },
                },
                {
                    description: {
                        $regex: req.query.keyword,
                        $options: 'i',
                    },
                },
            ],
        }
        : {};

    // Category filter
    const categoryFilter = req.query.category ? { category: req.query.category } : {};

    // Brand filter
    const brandFilter = req.query.brand ? { brand: req.query.brand } : {};

    // Price range filter
    const priceQuery = {};
    if (req.query.minPrice) {
        priceQuery.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
        priceQuery.$lte = Number(req.query.maxPrice);
    }

    // Rating filter
    const ratingFilter = req.query.minRating ? { rating: { $gte: Number(req.query.minRating) } } : {};

    // Combine all filters
    const filter = {
        ...keyword,
        ...categoryFilter,
        ...brandFilter,
        ...ratingFilter,
    };
    if (Object.keys(priceQuery).length > 0) {
        filter.price = priceQuery;
    }

    // Sorting
    let sort = {};
    if (req.query.sortBy) {
        switch (req.query.sortBy) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'rating_desc':
                sort = { rating: -1 };
                break;
            case 'name_asc':
                sort = { name: 1 };
                break;
            case 'name_desc':
                sort = { name: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'oldest':
                sort = { createdAt: 1 };
                break;
            default:
                sort = { createdAt: -1 };
        }
    } else {
        sort = { createdAt: -1 }; // Default sort by newest
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
        .sort(sort)
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    // Set rating to 5 if not set
    products.forEach(p => { if (!p.rating) p.rating = 5; });

    res.json({
        products,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        const prodObj = product.toObject();
        prodObj.defaultReview = product.defaultReview;
        res.json(prodObj);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        name: req.body.name || 'Sample name',
        price: req.body.price || 0,
        user: req.user._id,
        image: req.body.image || '/images/sample.jpg',
        brand: req.body.brand || 'Sample brand',
        category: req.body.category || 'Sample category',
        countInStock: req.body.countInStock || 0,
        numReviews: 0,
        description: req.body.description || 'Sample description',
        defaultReview: req.body.defaultReview || {
            name: 'Admin',
            rating: req.body.defaultRating || 5,
            comment: req.body.defaultComment || 'Great product!'
        },
        rating: req.body.defaultRating || 5,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        image,
        brand,
        category,
        countInStock,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.brand = brand;
        product.category = category;
        product.countInStock = countInStock;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;

        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true }).limit(4);

  res.json(products);
});

// @desc    Get all unique brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
    const brands = await Product.distinct('brand');
    res.json(brands.filter(Boolean));
});

// @desc    Get all unique categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category');
    res.json(categories.filter(Boolean));
});

export {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
    getTopProducts,
    getFeaturedProducts,
    getBrands,
    getCategories,
}; 