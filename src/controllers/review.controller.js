const reviewService = require('../services/review.service');

exports.listByProduct = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await reviewService.listByProduct(req.params.id, { page, limit });
    res.json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Lỗi server' });
  }
};

exports.create = async (req, res) => {
  try {
    const customerId = req.customerId;
    const result = await reviewService.create(req.params.id, customerId, req.body || {});
    res.status(201).json(result);
  } catch (error) {
    const status = error.statusCode || 400;
    res.status(status).json({ error: error.message || 'Không thể tạo bình luận' });
  }
};
