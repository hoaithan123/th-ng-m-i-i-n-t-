// routes/auth.routes.js (Phiên bản mới)
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const customerAuth = require('../middleware/customerAuth'); // Auth Middleware của khách hàng
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Bỏ hết logic Joi, Prisma, bcrypt, JWT khỏi đây

// Đăng ký và Đăng nhập (Public)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Lấy/Cập nhật thông tin khách hàng hiện tại (Protected)
router.get('/profile', customerAuth, authController.getProfile);
router.put('/profile', customerAuth, authController.updateProfile);

// Đăng nhập nhân viên/admin
router.post('/employee/login', async (req, res) => {
  try {
    const { tai_khoan, mat_khau } = req.body;

    if (!tai_khoan || !mat_khau) {
      return res.status(400).json({ error: 'Tài khoản và mật khẩu là bắt buộc' });
    }

    const nhanVien = await prisma.nhan_vien.findFirst({
      where: { tai_khoan },
    });

    if (!nhanVien) {
      return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không đúng' });
    }

    const isValidPassword = await bcrypt.compare(mat_khau, nhanVien.mat_khau);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      {
        id: nhanVien.id,
        vai_tro: nhanVien.vai_tro,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      nhanVien: {
        id: nhanVien.id,
        ho_ten: nhanVien.ho_ten,
        tai_khoan: nhanVien.tai_khoan,
        vai_tro: nhanVien.vai_tro,
        email: nhanVien.email,
      },
    });
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ error: 'Lỗi khi đăng nhập nhân viên' });
  }
});

// Quên mật khẩu nhân viên/admin
router.post('/employee/forgot-password', async (req, res) => {
  try {
    const { tai_khoan, mat_khau_moi } = req.body;

    if (!tai_khoan || !mat_khau_moi) {
      return res.status(400).json({ error: 'Tài khoản và mật khẩu mới là bắt buộc' });
    }

    const nhanVien = await prisma.nhan_vien.findFirst({
      where: { tai_khoan },
    });

    if (!nhanVien) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản nhân viên' });
    }

    const hashedPassword = await bcrypt.hash(mat_khau_moi, 10);

    await prisma.nhan_vien.update({
      where: { id: nhanVien.id },
      data: { mat_khau: hashedPassword },
    });

    res.json({ message: 'Cập nhật mật khẩu mới thành công' });
  } catch (error) {
    console.error('Employee forgot password error:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật mật khẩu mới' });
  }
});

module.exports = router;