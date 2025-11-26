const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create = async (productId, customerId, data) => {
  const sao = Number(data.sao);
  const noi_dung = typeof data.noi_dung === 'string' ? data.noi_dung.trim() : null;
  if (!sao || sao < 1 || sao > 5) {
    const err = new Error('Số sao phải từ 1 đến 5');
    err.statusCode = 400;
    throw err;
  }

  const review = await prisma.danh_gia.create({
    data: {
      id_san_pham: Number(productId),
      id_khach_hang: Number(customerId),
      sao,
      noi_dung: noi_dung || null,
    },
    include: {
      khach_hang: { select: { ho_ten: true } }
    }
  });

  const agg = await prisma.danh_gia.aggregate({
    where: { id_san_pham: Number(productId) },
    _avg: { sao: true },
    _count: { sao: true }
  });

  return {
    item: {
      id: review.id,
      sao: review.sao,
      noi_dung: review.noi_dung,
      ngay_tao: review.ngay_tao,
      khach_hang: { ho_ten: review.khach_hang?.ho_ten || 'Ẩn danh' }
    },
    aggregate: {
      average: agg._avg.sao || 0,
      count: agg._count.sao || 0
    }
  };
};

exports.listByProduct = async (productId, { page = 1, limit = 10 } = {}) => {
  const p = Number(page) || 1;
  const l = Number(limit) || 10;
  const skip = (p - 1) * l;

  const [total, items, agg] = await Promise.all([
    prisma.danh_gia.count({ where: { id_san_pham: Number(productId) } }),
    prisma.danh_gia.findMany({
      where: { id_san_pham: Number(productId) },
      orderBy: { ngay_tao: 'desc' },
      skip,
      take: l,
      include: { khach_hang: { select: { ho_ten: true } } }
    }),
    prisma.danh_gia.aggregate({
      where: { id_san_pham: Number(productId) },
      _avg: { sao: true },
      _count: { sao: true }
    })
  ]);

  return {
    pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    aggregate: { average: agg._avg.sao || 0, count: agg._count.sao || 0 },
    items: items.map(r => ({
      id: r.id,
      sao: r.sao,
      noi_dung: r.noi_dung,
      ngay_tao: r.ngay_tao,
      khach_hang: { ho_ten: r.khach_hang?.ho_ten || 'Ẩn danh' }
    }))
  };
};

exports.aggregateByProduct = async (productId) => {
  const agg = await prisma.danh_gia.aggregate({
    where: { id_san_pham: Number(productId) },
    _avg: { sao: true },
    _count: { sao: true }
  });
  return {
    average: agg._avg.sao || 0,
    count: agg._count.sao || 0
  };
};
