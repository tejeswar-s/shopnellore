const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-payment-intent', protect, createPaymentIntent);

module.exports = router; 