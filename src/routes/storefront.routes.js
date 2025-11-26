// routes/storefront.routes.js (Đã ổn)
const express = require('express');
const router = express.Router();
const storefrontController = require('../controllers/storefront.controller');
const reviewController = require('../controllers/review.controller');
const customerAuth = require('../middleware/customerAuth');

// Public routes - không cần auth
router.get('/products', storefrontController.getProducts);
router.get('/products/:id', storefrontController.getProductDetail);
router.get('/suggestions', storefrontController.getSuggestions);
router.get('/recommendations/time-based', storefrontController.getTimeBasedRecommendations);

// Reviews
router.get('/products/:id/reviews', reviewController.listByProduct);
router.post('/products/:id/reviews', customerAuth, reviewController.create);

module.exports = router;