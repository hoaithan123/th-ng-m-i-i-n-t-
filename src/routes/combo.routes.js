// routes/combo.routes.js
const express = require('express');
const router = express.Router();
const comboController = require('../controllers/combo.controller');
const customerAuth = require('../middleware/customerAuth');
const { authenticateToken, checkRole } = require('../middleware/auth');

// Public routes - lấy danh sách combo
router.get('/', comboController.getAllCombos);
router.get('/:id', comboController.getComboById);

// Customer routes - thêm combo vào giỏ hàng
router.post('/:id/add-to-cart', customerAuth, comboController.addComboToCart);

// Admin routes - quản lý combo
router.post('/', authenticateToken, checkRole(['quan_ly']), comboController.createCombo);
router.put('/:id', authenticateToken, checkRole(['quan_ly']), comboController.updateCombo);
router.delete('/:id', authenticateToken, checkRole(['quan_ly']), comboController.deleteCombo);

module.exports = router;

