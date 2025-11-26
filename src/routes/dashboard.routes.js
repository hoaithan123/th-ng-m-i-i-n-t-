// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    // === CÁC THỐNG KÊ CŨ (GIỮ NGUYÊN) ===
    const totalProducts = await prisma.san_pham.count();
    const totalEmployees = await prisma.nhan_vien.count();
    const totalInvoices = await prisma.don_hang.count();
    const revenueResult = await prisma.don_hang.aggregate({
      _sum: { tong_tien: true },
      where: { trang_thai: 'da_giao' }
    });
    const totalRevenue = Number(revenueResult._sum.tong_tien || 0);

    const stockByTypeRaw = await prisma.san_pham.groupBy({
      by: ['don_vi_tinh'],
      _sum: { so_luong: true },
    });
    const stockByType = stockByTypeRaw.map((item) => ({
      type: item.don_vi_tinh || 'Không xác định',
      value: Number(item._sum.so_luong || 0),
    }));
    const lastSale = await prisma.hoa_don_ban.findFirst({
      orderBy: { ngay_ban: 'desc' },
    });
    // Tính doanh thu 7 ngày gần nhất theo ngày hiện tại (DB-agnostic, không phụ thuộc hàm MySQL)
    const pad2 = (n) => String(n).padStart(2, '0');
    const fmtKey = (date) => {
      const d = new Date(date);
      const y = d.getFullYear();
      const m = pad2(d.getMonth() + 1);
      const dd = pad2(d.getDate());
      return `${y}-${m}-${dd}`;
    };

    const todayLocal = new Date();
    const endLocal = new Date(todayLocal);
    endLocal.setHours(23, 59, 59, 999);
    const startLocal = new Date(todayLocal);
    startLocal.setHours(0, 0, 0, 0);
    startLocal.setDate(startLocal.getDate() - 6);
    const toUtc = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    const start = toUtc(startLocal);
    const end = toUtc(endLocal);

    const orders = await prisma.don_hang.findMany({
      where: {
        trang_thai: 'da_giao',
        ngay_tao: {
          gte: start,
          lte: end,
        },
      },
      select: { ngay_tao: true, tong_tien: true, id_khach_hang: true },
      orderBy: { ngay_tao: 'asc' },
    });

    const revenueMap = new Map();
    const buyerSetMap = new Map(); // date -> Set of unique customer IDs

    for (const order of orders) {
      const key = fmtKey(order.ngay_tao);
      const cur = revenueMap.get(key) || 0;
      revenueMap.set(key, cur + Number(order.tong_tien || 0));
      const set = buyerSetMap.get(key) || new Set();
      if (order.id_khach_hang != null) {
        set.add(order.id_khach_hang);
      }
      buyerSetMap.set(key, set);
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startLocal);
      d.setDate(startLocal.getDate() + i);
      return fmtKey(d);
    });

    const dailyRevenue = last7Days.map((d) => ({
      date: d,
      revenue: Number(revenueMap.get(d) || 0),
      buyers: buyerSetMap.get(d) ? buyerSetMap.get(d).size : 0,
    }));

    // Tổng số người mua (duy nhất) trong 7 ngày gần nhất
    const uniqueBuyersLast7Days = new Set();
    for (const o of orders) {
      if (o.id_khach_hang != null) uniqueBuyersLast7Days.add(o.id_khach_hang);
    }
    const totalBuyersLast7Days = uniqueBuyersLast7Days.size;

    const topSellingProductsRaw = await prisma.$queryRaw`
      SELECT 
        p.ten_san_pham, 
        SUM(ct.so_luong) as total_sold
      FROM chi_tiet_hoa_don_ban AS ct
      JOIN san_pham AS p ON ct.id_san_pham = p.id
      GROUP BY p.ten_san_pham
      ORDER BY total_sold DESC
      LIMIT 5
    `;
    const topSellingProducts = topSellingProductsRaw.map(p => ({
      name: p.ten_san_pham,
      sold: Number(p.total_sold),
    }));
    const LOW_STOCK_THRESHOLD = 20;
    const lowStockProducts = await prisma.san_pham.findMany({
      where: {
        so_luong: {
          lt: LOW_STOCK_THRESHOLD,
        },
      },
      orderBy: {
        so_luong: 'asc',
      },
      take: 5,
      select: {
        ten_san_pham: true,
        so_luong: true,
      },
    });

    // =================================================================
    // <<< THÊM CHỨC NĂNG MỚI TẠI ĐÂY >>>
    // =================================================================

    // === MỚI: Nhân viên của tháng ===
    // === MỚI: Top 3 Nhân viên của tháng ===
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Lấy danh sách nhân viên có doanh thu cao nhất
    const topEmployeesResult = await prisma.hoa_don_ban.groupBy({
      by: ['id_nhan_vien'],
      _sum: { tong_tien: true },
      where: {
        id_nhan_vien: { not: null },
        ngay_ban: { gte: currentMonthStart }
      },
      orderBy: { _sum: { tong_tien: 'desc' } },
      take: 3, // Lấy top 3 thay vì 1
    });

    let topEmployees = []; // Đổi tên thành số nhiều

    if (topEmployeesResult.length > 0) {
      // Lấy ID của các nhân viên top đầu
      const employeeIds = topEmployeesResult.map(item => item.id_nhan_vien);

      // Tìm thông tin (tên) của các nhân viên đó trong 1 lần query
      const employees = await prisma.nhan_vien.findMany({
        where: { id: { in: employeeIds } },
        select: { id: true, ho_ten: true }
      });

      // Tạo một map để dễ dàng tra cứu tên từ ID
      const employeeMap = new Map(employees.map(e => [e.id, e.ho_ten]));

      // Kết hợp kết quả doanh thu và tên nhân viên
      topEmployees = topEmployeesResult.map(result => ({
        name: employeeMap.get(result.id_nhan_vien) || 'Nhân viên đã bị xóa',
        revenue: Number(result._sum.tong_tien || 0),
      }));
    }

    // === MỚI: Hoạt động gần đây (mua hàng của khách hàng từ customer-app) ===
    const recentCustomerOrders = await prisma.don_hang.findMany({
      take: 5,
      orderBy: { ngay_tao: 'desc' },
      include: { khach_hang: { select: { ho_ten: true } } }
    });

    const recentActivities = recentCustomerOrders.map(order => ({
      type: 'customer_purchase',
      date: order.ngay_tao,
      description: `${order.khach_hang?.ho_ten || 'Khách hàng'} vừa mua hàng trị giá ${new Intl.NumberFormat('vi-VN').format(order.tong_tien)}₫.`
    }));

    // === TRẢ VỀ DỮ LIỆU ĐÃ MỞ RỘNG ===
    res.json({
      stats: {
        totalProducts,
        totalEmployees,
        totalInvoices,
        totalRevenue,
        totalBuyersLast7Days,
      },
      charts: {
        dailyRevenue,
        stockByType,
      },
      topSellingProducts,
      lowStockProducts: lowStockProducts.map(p => ({ name: p.ten_san_pham, quantity: p.so_luong })),
      // Thêm dữ liệu mới
      topEmployees,
      recentActivities,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy dữ liệu dashboard' });
  }
});

module.exports = router;