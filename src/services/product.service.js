// services/product.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CustomError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}
// Gợi ý tìm kiếm dựa trên từ khóa và danh mục
exports.getSuggestions = async (q) => {
    const query = String(q || '').trim();
    if (!query) return [];

    const items = await prisma.san_pham.findMany({
        where: {
            OR: [
                { ten_san_pham: { contains: query } },
                { ma_san_pham: { contains: query } }
            ]
        },
        select: { id: true, ten_san_pham: true, danh_muc: true },
        take: 8
    });
    return items.map(i => ({ id: i.id, label: i.ten_san_pham, category: i.danh_muc }));
};

// ------------------------------------------
// ADMIN: Tạo sản phẩm
// ------------------------------------------
exports.createProduct = async (data) => {
    try {
        // Kiểm tra logic nghiệp vụ phức tạp hơn (ví dụ: mã sản phẩm duy nhất)
        const existing = await prisma.san_pham.findUnique({
            where: { ma_san_pham: data.ma_san_pham }
        });
        if (existing) {
            throw new CustomError('Mã sản phẩm đã tồn tại', 400);
        }
        
        return prisma.san_pham.create({
            data: {
                ...data,
                gia_ban: parseFloat(data.gia_ban),
                so_luong: parseInt(data.so_luong),
            }
        });
    } catch (error) {
        throw error;
    }
};

// ------------------------------------------
// ADMIN/STOREFRONT: Lấy danh sách sản phẩm
// ------------------------------------------
exports.getAllProducts = async (isAdmin = false, options = {}) => {
    const { page = 1, limit = 12, sortBy = 'ten_san_pham', sortOrder = 'asc', q, minPrice, maxPrice, inStock = false, nameKeywords, category, tags } = options;

    const selectFields = isAdmin
        ? undefined // Admin: lấy full
        : { 
            id: true, 
            ten_san_pham: true, 
            ma_san_pham: true, 
            gia_ban: true, 
            don_vi_tinh: true,
            so_luong: true,
            hinh_anh: true,
            danh_muc: true,
            tags: true
        }; 

    const where = {};

    if (!isAdmin && inStock) {
        where.so_luong = { gt: 0 };
    }
    if (q) {
        where.OR = [
            { ten_san_pham: { contains: q } },
            { ma_san_pham: { contains: q } }
        ];
    }
    if (Array.isArray(nameKeywords) && nameKeywords.length > 0) {
        const ors = nameKeywords.map((kw) => ({ ten_san_pham: { contains: kw } }));
        if (where.OR) {
            where.OR = [...where.OR, ...ors];
        } else {
            where.OR = ors;
        }
    }
    if (category) {
        where.danh_muc = category;
    }
    // Filter by tags (supports multiple tags separated by comma)
    if (tags) {
        const tagArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
        if (tagArray.length > 0) {
            if (!where.OR) where.OR = [];
            // Tìm sản phẩm có tags chứa bất kỳ tag nào
            const tagConditions = tagArray.map(tag => ({
                tags: { contains: tag }
            }));
            where.OR = where.OR.length > 0 
                ? [...where.OR, ...tagConditions]
                : tagConditions;
        }
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
        where.gia_ban = {};
        if (minPrice !== undefined) where.gia_ban.gte = minPrice;
        if (maxPrice !== undefined) where.gia_ban.lte = maxPrice;
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [total, items] = await Promise.all([
        prisma.san_pham.count({ where }),
        prisma.san_pham.findMany({
            where,
            select: selectFields,
            orderBy: { [sortBy]: sortOrder },
            skip,
            take
        })
    ]);

    // Attach rating aggregates (average stars and review count)
    let itemsWithRating = items;
    try {
        if (Array.isArray(items) && items.length > 0) {
            const ids = items.map((p) => p.id).filter(Boolean);
            if (ids.length > 0) {
                const ratingAgg = await prisma.danh_gia.groupBy({
                    by: ['id_san_pham'],
                    where: { id_san_pham: { in: ids } },
                    _avg: { sao: true },
                    _count: { sao: true }
                });
                const ratingMap = new Map(
                    ratingAgg.map((r) => [
                        r.id_san_pham,
                        {
                            diem_trung_binh: Number(r._avg.sao || 0),
                            so_luot_danh_gia: Number(r._count.sao || 0)
                        }
                    ])
                );
                itemsWithRating = items.map((p) => ({
                    ...p,
                    diem_trung_binh: ratingMap.get(p.id)?.diem_trung_binh || 0,
                    so_luot_danh_gia: ratingMap.get(p.id)?.so_luot_danh_gia || 0
                }));
            }
        }
    } catch (_) {
        // Không chặn trả về nếu lỗi aggregate; giữ nguyên items
    }

    return {
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
        items: itemsWithRating
    };
};

// ------------------------------------------
// ADMIN/STOREFRONT: Lấy chi tiết sản phẩm
// ------------------------------------------
exports.getProductDetail = async (productId, isAdmin = false) => {
    const product = await prisma.san_pham.findUnique({
        where: { id: Number(productId) }
    });
    
    if (!product || (!isAdmin && product.so_luong <= 0)) {
        throw new CustomError('Sản phẩm không tồn tại hoặc đã hết hàng', 404);
    }
    
    // Admin có thể thấy mọi chi tiết, Khách hàng chỉ thấy những gì cần thiết
    if (!isAdmin) {
        // ... filter các trường nhạy cảm như số lượng tồn kho chính xác
    }
    
    // Attach rating aggregate for product detail
    try {
        const agg = await prisma.danh_gia.aggregate({
            where: { id_san_pham: Number(productId) },
            _avg: { sao: true },
            _count: { sao: true }
        });
        return {
            ...product,
            diem_trung_binh: Number(agg._avg.sao || 0),
            so_luot_danh_gia: Number(agg._count.sao || 0)
        };
    } catch (_) {
        return product;
    }
};

// ------------------------------------------
// ADMIN: Cập nhật sản phẩm
// ------------------------------------------
exports.updateProduct = async (productId, data) => {
    try {
        return prisma.san_pham.update({
            where: { id: Number(productId) },
            data: {
                ...data,
                gia_ban: parseFloat(data.gia_ban),
                so_luong: parseInt(data.so_luong),
            }
        });
    } catch (e) {
        // Xử lý lỗi Not Found của Prisma khi update
        if (e.code === 'P2025') { 
            throw new CustomError(`Không tìm thấy sản phẩm với id ${productId}`, 404);
        }
        throw e;
    }
};

// ------------------------------------------
// ADMIN: Xóa sản phẩm
// ------------------------------------------
exports.deleteProduct = async (productId) => {
    try {
        await prisma.san_pham.delete({
            where: { id: Number(productId) },
        });
    } catch (e) {
         if (e.code === 'P2025') { 
            throw new CustomError(`Không tìm thấy sản phẩm với id ${productId}`, 404);
        }
        throw e;
    }
};

// ------------------------------------------
// STOREFRONT: Gợi ý sản phẩm theo giờ giấc và tags
// ------------------------------------------
exports.getTimeBasedRecommendations = async (timeOfDay = null, tags = null, limit = 12) => {
    try {
        // Danh sách categories cần loại trừ (không phải đồ ăn/đồ uống)
        const excludeCategories = ['household', 'personalcare', 'groceries'];
        
        // Nếu không truyền timeOfDay, tự động xác định theo giờ hiện tại
        let targetTags = tags;
        if (!targetTags && !timeOfDay) {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const timeInMinutes = hour * 60 + minute;
            
            // 5h sáng - 10h sáng: Đồ ăn sáng
            if (timeInMinutes >= 5 * 60 && timeInMinutes < 10 * 60) {
                timeOfDay = 'morning';
            }
            // 10h sáng - 13h30 chiều: Đồ ăn chính
            else if (timeInMinutes >= 10 * 60 && timeInMinutes < 13 * 60 + 30) {
                timeOfDay = 'lunch';
            }
            // 13h30 - 18h (trước 6h tối): Ăn nhẹ/vặt
            else if (timeInMinutes >= 13 * 60 + 30 && timeInMinutes < 18 * 60) {
                timeOfDay = 'afternoon_snack';
            }
            // 18h - 22h (6h tối - 10h tối): Món ăn chính
            else if (timeInMinutes >= 18 * 60 && timeInMinutes < 22 * 60) {
                timeOfDay = 'dinner';
            }
            // Sau 22h (10h tối): Đồ ăn nhẹ/vặt
            else {
                timeOfDay = 'late_night';
            }
        }

        // Xác định tags và categories dựa trên timeOfDay
        // Chỉ bao gồm đồ ăn/đồ uống, loại trừ household, personalcare
        if (!targetTags && timeOfDay) {
            switch (timeOfDay) {
                case 'morning': // 5h-10h: Đồ ăn sáng, cà phê, ăn nhẹ
                    targetTags = ['đồ ăn sáng', 'cà phê', 'đồ uống', 'đồ ăn nhẹ'];
                    break;
                case 'lunch': // 10h-13h30: Đồ ăn chính, món ăn chính, món ăn no
                    targetTags = ['đồ ăn chính', 'món ăn chính', 'món ăn no', 'đồ ăn'];
                    break;
                case 'afternoon_snack': // 13h30-18h: Ăn nhẹ, ăn vặt
                    targetTags = ['đồ ăn nhẹ', 'ăn vặt', 'snack'];
                    break;
                case 'dinner': // 18h-22h: Món ăn chính, ăn no
                    targetTags = ['đồ ăn chính', 'món ăn chính', 'món ăn no', 'đồ ăn'];
                    break;
                case 'late_night': // Sau 22h: Đồ ăn nhẹ, ăn vặt
                    targetTags = ['đồ ăn nhẹ', 'ăn vặt', 'snack'];
                    break;
                default:
                    targetTags = ['đồ ăn'];
            }
        }

        // Nếu có tags cụ thể, chuyển thành array nếu là string
        if (typeof targetTags === 'string') {
            targetTags = [targetTags];
        }

        // Tạo where clause để tìm sản phẩm có chứa ít nhất một trong các tags
        // LOẠI TRỪ các categories không phải đồ ăn/đồ uống
        const where = {
            so_luong: { gt: 0 }, // Chỉ lấy sản phẩm còn hàng
            danh_muc: { notIn: excludeCategories } // Loại trừ household, personalcare, groceries
        };

        // Mapping categories theo khung giờ để dùng làm fallback
        // CHỈ bao gồm đồ ăn/đồ uống, LOẠI TRỪ: household, personalcare, groceries
        // Categories hợp lệ: drinks, snacks, dairy, instant, frozen
        const categoryMap = {
            'morning': ['drinks', 'dairy', 'snacks'], // Đồ ăn sáng: đồ uống, sữa, bánh kẹo
            'lunch': ['instant', 'frozen'], // Bữa trưa: mì ăn liền, đồ đông lạnh (món chính)
            'afternoon_snack': ['snacks', 'drinks'], // Xế chiều: bánh kẹo, đồ uống
            'dinner': ['instant', 'frozen'], // Bữa tối: mì ăn liền, đồ đông lạnh (món chính)
            'late_night': ['instant', 'snacks', 'frozen'] // Khuya: mì ăn liền, bánh kẹo, đồ đông lạnh
        };
        

        if (targetTags && Array.isArray(targetTags) && targetTags.length > 0) {
            // Tìm sản phẩm có tags chứa bất kỳ tag nào trong danh sách
            where.OR = targetTags.map(tag => ({
                tags: { contains: tag }
            }));
        }

        let products = await prisma.san_pham.findMany({
            where,
            select: {
                id: true,
                ten_san_pham: true,
                ma_san_pham: true,
                gia_ban: true,
                don_vi_tinh: true,
                so_luong: true,
                hinh_anh: true,
                danh_muc: true,
                tags: true
            },
            take: limit,
            orderBy: { ngay_tao: 'desc' }
        });

        // Fallback: Nếu không tìm thấy sản phẩm theo tags, filter theo danh_muc
        // Đảm bảo vẫn loại trừ các categories không phải đồ ăn/đồ uống
        if (products.length === 0 && timeOfDay && categoryMap[timeOfDay]) {
            const fallbackWhere = {
                so_luong: { gt: 0 },
                AND: [
                    { danh_muc: { in: categoryMap[timeOfDay] } },
                    { danh_muc: { notIn: excludeCategories } }
                ]
            };
            
            products = await prisma.san_pham.findMany({
                where: fallbackWhere,
                select: {
                    id: true,
                    ten_san_pham: true,
                    ma_san_pham: true,
                    gia_ban: true,
                    don_vi_tinh: true,
                    so_luong: true,
                    hinh_anh: true,
                    danh_muc: true,
                    tags: true
                },
                take: limit,
                orderBy: { ngay_tao: 'desc' }
            });
        }

        // Fallback cuối cùng: Lấy bất kỳ sản phẩm đồ ăn/đồ uống còn hàng (loại trừ household, personalcare, groceries)
        if (products.length === 0) {
            // Chỉ lấy các categories đồ ăn/đồ uống
            const foodCategories = ['drinks', 'snacks', 'dairy', 'instant', 'frozen'];
            
            products = await prisma.san_pham.findMany({
                where: { 
                    so_luong: { gt: 0 },
                    AND: [
                        { danh_muc: { in: foodCategories } },
                        { danh_muc: { notIn: excludeCategories } }
                    ]
                },
                select: {
                    id: true,
                    ten_san_pham: true,
                    ma_san_pham: true,
                    gia_ban: true,
                    don_vi_tinh: true,
                    so_luong: true,
                    hinh_anh: true,
                    danh_muc: true,
                    tags: true
                },
                take: limit,
                orderBy: { ngay_tao: 'desc' }
            });
        }

        // Attach rating aggregates to returned products
        try {
            if (Array.isArray(products) && products.length > 0) {
                const ids = products.map((p) => p.id).filter(Boolean);
                if (ids.length > 0) {
                    const ratingAgg = await prisma.danh_gia.groupBy({
                        by: ['id_san_pham'],
                        where: { id_san_pham: { in: ids } },
                        _avg: { sao: true },
                        _count: { sao: true }
                    });
                    const ratingMap = new Map(
                        ratingAgg.map((r) => [
                            r.id_san_pham,
                            {
                                diem_trung_binh: Number(r._avg.sao || 0),
                                so_luot_danh_gia: Number(r._count.sao || 0)
                            }
                        ])
                    );
                    products = products.map((p) => ({
                        ...p,
                        diem_trung_binh: ratingMap.get(p.id)?.diem_trung_binh || 0,
                        so_luot_danh_gia: ratingMap.get(p.id)?.so_luot_danh_gia || 0
                    }));
                }
            }
        } catch (_) {
            // ignore rating errors
        }

        return products;
    } catch (error) {
        throw error;
    }
};