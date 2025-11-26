const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const customerAuth = require('../middleware/customerAuth');
const { authenticateToken, checkRole } = require('../middleware/auth');
const Joi = require('joi');

// Schema validation
const registerSchema = Joi.object({
  ho_ten: Joi.string().required().messages({
    'string.empty': 'Họ tên không được để trống'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'string.empty': 'Email không được để trống'
  }),
  so_dien_thoai: Joi.string().pattern(/^[0-9]{10,11}$/).required().messages({
    'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số'
  }),
  mat_khau: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  mat_khau: Joi.string().required()
});

// Đăng ký khách hàng
router.post('/register', async (req, res) => {
  try {
    console.log('Dữ liệu nhận được:', req.body);
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.log('Lỗi validation:', error.details[0].message);
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }

    const { ho_ten, email, so_dien_thoai, mat_khau } = value;

    // Kiểm tra email đã tồn tại
    const existingCustomer = await prisma.khach_hang.findUnique({
      where: { email }
    });

    if (existingCustomer) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(mat_khau, 10);

    // Tạo khách hàng mới
    const customer = await prisma.khach_hang.create({
      data: {
        ho_ten,
        email,
        so_dien_thoai,
        mat_khau: hashedPassword
      },
      select: {
        id: true,
        ho_ten: true,
        email: true,
        so_dien_thoai: true
      }
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      customer
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Lỗi khi đăng ký tài khoản' });
  }
});

// Đăng nhập khách hàng
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }

    const { email, mat_khau } = value;

    // Tìm khách hàng
    const customer = await prisma.khach_hang.findUnique({
      where: { email }
    });

    if (!customer) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isValidPassword = await bcrypt.compare(mat_khau, customer.mat_khau);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo token
    const token = jwt.sign(
      { 
        id: customer.id,
        type: 'customer' // Quan trọng: phân biệt với token admin
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      customer: {
        id: customer.id,
        ho_ten: customer.ho_ten,
        email: customer.email,
        so_dien_thoai: customer.so_dien_thoai
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi khi đăng nhập' });
  }
});

// Lấy thông tin khách hàng hiện tại
router.get('/profile', customerAuth, async (req, res) => {
  try {
    const customer = await prisma.khach_hang.findUnique({
      where: { id: req.customerId },
      select: {
        id: true,
        ho_ten: true,
        email: true,
        so_dien_thoai: true,
        dia_chi: true,
        ngay_tao: true
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin khách hàng' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin' });
  }
});

// Cập nhật thông tin khách hàng
router.put('/profile', customerAuth, async (req, res) => {
  try {
    const { ho_ten, so_dien_thoai, dia_chi } = req.body;

    const customer = await prisma.khach_hang.update({
      where: { id: req.customerId },
      data: {
        ho_ten,
        so_dien_thoai,
        dia_chi
      },
      select: {
        id: true,
        ho_ten: true,
        email: true,
        so_dien_thoai: true,
        dia_chi: true
      }
    });

    res.json({
      message: 'Cập nhật thông tin thành công',
      customer
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật thông tin' });
  }
});

// Admin routes - Lấy tất cả khách hàng
router.get('/admin/all', authenticateToken, checkRole('quan_ly'), async (req, res) => {
  try {
    const customers = await prisma.khach_hang.findMany({
      select: {
        id: true,
        ho_ten: true,
        email: true,
        so_dien_thoai: true,
        dia_chi: true,
        ngay_tao: true,
        trang_thai: true
      },
      orderBy: {
        ngay_tao: 'desc'
      }
    });

    res.json(customers);
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách khách hàng' });
  }
});

// Admin routes - Lấy chi tiết khách hàng
router.get('/admin/:id', authenticateToken, checkRole('quan_ly'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await prisma.khach_hang.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        ho_ten: true,
        email: true,
        so_dien_thoai: true,
        dia_chi: true,
        ngay_tao: true,
        trang_thai: true
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer detail error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin khách hàng' });
  }
});

// Admin routes - Cập nhật trạng thái khách hàng
router.put('/admin/:id/status', authenticateToken, checkRole('quan_ly'), async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    if (!trang_thai || !['active', 'inactive'].includes(trang_thai)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    const customer = await prisma.khach_hang.update({
      where: { id: parseInt(id) },
      data: { trang_thai },
      select: {
        id: true,
        ho_ten: true,
        email: true,
        trang_thai: true
      }
    });

    res.json({
      message: 'Cập nhật trạng thái thành công',
      customer
    });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái khách hàng' });
  }
});

module.exports = router;