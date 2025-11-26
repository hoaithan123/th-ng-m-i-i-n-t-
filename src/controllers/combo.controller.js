// controllers/combo.controller.js
const comboService = require('../services/combo.service');

const handleServiceError = (res, error) => {
    const statusCode = error.statusCode || 500;
    const payload = {
        error: error.message || 'Lỗi server',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
    res.status(statusCode).json(payload);
};

// Lấy danh sách combo
exports.getAllCombos = async (req, res) => {
    try {
        const combos = await comboService.getAllCombos();
        res.json(combos);
    } catch (error) {
        handleServiceError(res, error);
    }
};

// Lấy chi tiết combo
exports.getComboById = async (req, res) => {
    try {
        const { id } = req.params;
        const combo = await comboService.getComboById(id);
        res.json(combo);
    } catch (error) {
        handleServiceError(res, error);
    }
};

// Thêm combo vào giỏ hàng
exports.addComboToCart = async (req, res) => {
    try {
        const { id } = req.params;
        const { so_luong } = req.body;
        const result = await comboService.addComboToCart(req.customerId, id, so_luong);
        res.json({
            message: 'Đã thêm combo vào giỏ hàng',
            ...result
        });
    } catch (error) {
        handleServiceError(res, error);
    }
};

// [ADMIN] Tạo combo mới
exports.createCombo = async (req, res) => {
    try {
        const combo = await comboService.createCombo(req.body);
        res.status(201).json(combo);
    } catch (error) {
        handleServiceError(res, error);
    }
};

// [ADMIN] Cập nhật combo
exports.updateCombo = async (req, res) => {
    try {
        const { id } = req.params;
        const combo = await comboService.updateCombo(id, req.body);
        res.json(combo);
    } catch (error) {
        handleServiceError(res, error);
    }
};

// [ADMIN] Xóa combo
exports.deleteCombo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await comboService.deleteCombo(id);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
};

