// services/cart.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Hàm tiện ích để ném ra lỗi có status code (giúp controller dễ xử lý)
class CustomError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

// ------------------------------------------
// 1. Lấy giỏ hàng (bao gồm cả combo)
// ------------------------------------------
exports.getCartItems = async (customerId) => {
    const [products, combos] = await Promise.all([
        prisma.gio_hang.findMany({
            where: { id_khach_hang: customerId },
            include: {
                san_pham: {
                    select: {
                        id: true,
                        ten_san_pham: true,
                        ma_san_pham: true,
                        gia_ban: true,
                        so_luong: true,
                        don_vi_tinh: true,
                        hinh_anh: true
                    }
                }
            },
            orderBy: { ngay_them: 'desc' }
        }),
        prisma.gio_hang_combo.findMany({
            where: { id_khach_hang: customerId },
            include: {
                combo_items: {
                    include: {
                        san_pham: {
                            select: {
                                id: true,
                                ten_san_pham: true,
                                ma_san_pham: true,
                                gia_ban: true,
                                hinh_anh: true
                            }
                        }
                    }
                }
            },
            orderBy: { ngay_them: 'desc' }
        })
    ]);

    // Merge và sắp xếp theo ngày thêm (mới nhất lên trên)
    const allItems = [
        ...products.map(item => ({ ...item, type: 'product', sortDate: item.ngay_them })),
        ...combos.map(item => ({ ...item, type: 'combo', sortDate: item.ngay_them }))
    ].sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

    return {
        products: products.map(item => ({ ...item, type: 'product' })),
        combos: combos.map(item => ({ ...item, type: 'combo' })),
        allItems // Thêm allItems để dễ xử lý
    };
};

// ------------------------------------------
// 2. Thêm sản phẩm vào giỏ (Logic phức tạp nhất)
// ------------------------------------------
exports.addItemToCart = async (customerId, id_san_pham, so_luong) => {
    // 1. Validate đầu vào
    const productId = Number(id_san_pham);
    const quantity = Number(so_luong);
    if (!productId || !quantity || quantity < 1) {
        throw new CustomError('Dữ liệu không hợp lệ', 400);
    }

    // 2. Kiểm tra khách hàng tồn tại (tránh lỗi FK P2003)
    const customer = await prisma.khach_hang.findUnique({ where: { id: Number(customerId) } });
    if (!customer) {
        throw new CustomError('Tài khoản khách hàng không tồn tại', 401);
    }

    // 3. Kiểm tra sản phẩm và tồn kho (Query 1)
    const product = await prisma.san_pham.findUnique({
        where: { id: productId },
        select: { id: true, so_luong: true, don_vi_tinh: true, ten_san_pham: true, gia_ban: true }
    });

    if (!product) {
        throw new CustomError('Sản phẩm không tồn tại', 404);
    }

    if (product.so_luong < quantity) {
        throw new CustomError(`Sản phẩm chỉ còn ${product.so_luong} ${product.don_vi_tinh}`, 400);
    }

    // 4. Kiểm tra sản phẩm đã có trong giỏ chưa (Query 2)
    const existingItem = await prisma.gio_hang.findUnique({
        where: {
            id_khach_hang_id_san_pham: {
                id_khach_hang: Number(customerId),
                id_san_pham: productId
            }
        }
    });

    let cartItem;
    const includeSelect = { // Tái sử dụng cấu trúc include/select
        san_pham: { select: { id: true, ten_san_pham: true, gia_ban: true, so_luong: true } }
    };

    if (existingItem) {
        // Cập nhật số lượng
        const newQuantity = existingItem.so_luong + quantity;

        if (newQuantity > product.so_luong) {
            throw new CustomError(`Số lượng vượt quá tồn kho (còn ${product.so_luong})`, 400);
        }

        try {
            cartItem = await prisma.gio_hang.update({
                where: { id: existingItem.id },
                data: { so_luong: newQuantity },
                include: includeSelect
            });
        } catch (e) {
            if (e.code === 'P2003') {
                throw new CustomError('Tham chiếu không hợp lệ (khách hàng/sản phẩm)', 400);
            }
            throw e;
        }
    } else {
        // Thêm mới
        try {
            cartItem = await prisma.gio_hang.create({
                data: { id_khach_hang: Number(customerId), id_san_pham: productId, so_luong: quantity },
                include: includeSelect
            });
        } catch (e) {
            if (e.code === 'P2003') {
                throw new CustomError('Tham chiếu không hợp lệ (khách hàng/sản phẩm)', 400);
            }
            throw e;
        }
    }

    return cartItem;
};

// ------------------------------------------
// 3. Cập nhật số lượng
// ------------------------------------------
exports.updateCartItemQuantity = async (id, customerId, so_luong) => {
    if (!so_luong || so_luong < 1) {
        throw new CustomError('Số lượng không hợp lệ', 400);
    }

    // 1. Kiểm tra item thuộc về khách hàng này và lấy thông tin sản phẩm
    const cartItem = await prisma.gio_hang.findFirst({
        where: { id: parseInt(id), id_khach_hang: customerId },
        include: { san_pham: true }
    });

    if (!cartItem) {
        throw new CustomError('Không tìm thấy sản phẩm trong giỏ', 404);
    }

    // 2. Kiểm tra tồn kho
    if (so_luong > cartItem.san_pham.so_luong) {
        throw new CustomError(`Sản phẩm chỉ còn ${cartItem.san_pham.so_luong} ${cartItem.san_pham.don_vi_tinh}`, 400);
    }

    // 3. Cập nhật
    return prisma.gio_hang.update({
        where: { id: parseInt(id) },
        data: { so_luong },
        include: { san_pham: { select: { id: true, ten_san_pham: true, gia_ban: true, so_luong: true } } }
    });
};

// ------------------------------------------
// 4. Xóa sản phẩm khỏi giỏ
// ------------------------------------------
exports.removeCartItem = async (id, customerId) => {
    // Idempotent delete: xóa theo id + id_khach_hang, không lỗi nếu không tồn tại
    const result = await prisma.gio_hang.deleteMany({
        where: { id: parseInt(id), id_khach_hang: customerId }
    });
    return { deleted: result.count > 0 };
};

// ------------------------------------------
// 5. Xóa toàn bộ giỏ hàng
// ------------------------------------------
exports.clearCart = async (customerId) => {
    await Promise.all([
        prisma.gio_hang.deleteMany({
            where: { id_khach_hang: customerId }
        }),
        prisma.gio_hang_combo.deleteMany({
            where: { id_khach_hang: customerId }
        })
    ]);
};

// ------------------------------------------
// 6. Thêm combo vào giỏ hàng (custom combo)
// ------------------------------------------
exports.addComboToCart = async (customerId, comboData) => {
    const { ten_combo, gia_ban, so_luong, items } = comboData;

    if (!ten_combo || !items || !Array.isArray(items) || items.length === 0) {
        throw new CustomError('Thông tin combo không hợp lệ', 400);
    }

    const quantity = Number(so_luong) || 1;
    const totalPrice = Number(gia_ban) || 0;

    // Kiểm tra tồn kho cho tất cả sản phẩm
    for (const item of items) {
        const product = await prisma.san_pham.findUnique({
            where: { id: item.id_san_pham }
        });

        if (!product) {
            throw new CustomError(`Sản phẩm ID ${item.id_san_pham} không tồn tại`, 404);
        }

        const requiredQuantity = item.so_luong * quantity;
        if (product.so_luong < requiredQuantity) {
            throw new CustomError(
                `Sản phẩm "${product.ten_san_pham}" chỉ còn ${product.so_luong}, cần ${requiredQuantity}`,
                400
            );
        }
    }

    // Tạo combo trong giỏ hàng
    return prisma.$transaction(async (tx) => {
        const cartCombo = await tx.gio_hang_combo.create({
            data: {
                id_khach_hang: Number(customerId),
                ten_combo: ten_combo,
                gia_ban: totalPrice.toFixed(2),
                so_luong: quantity,
                combo_items: {
                    create: items.map(item => ({
                        id_san_pham: item.id_san_pham,
                        ten_san_pham: item.ten_san_pham,
                        so_luong: item.so_luong,
                        don_gia: Number(item.gia_ban).toFixed(2)
                    }))
                }
            },
            include: {
                combo_items: {
                    include: {
                        san_pham: {
                            select: {
                                id: true,
                                ten_san_pham: true,
                                ma_san_pham: true,
                                gia_ban: true,
                                hinh_anh: true
                            }
                        }
                    }
                }
            }
        });

        return cartCombo;
    });
};

// ------------------------------------------
// 7. Cập nhật số lượng combo trong giỏ
// ------------------------------------------
exports.updateComboQuantity = async (id, customerId, so_luong) => {
    if (!so_luong || so_luong < 1) {
        throw new CustomError('Số lượng không hợp lệ', 400);
    }

    const cartCombo = await prisma.gio_hang_combo.findFirst({
        where: { id: parseInt(id), id_khach_hang: customerId },
        include: { combo_items: { include: { san_pham: true } } }
    });

    if (!cartCombo) {
        throw new CustomError('Không tìm thấy combo trong giỏ', 404);
    }

    // Kiểm tra tồn kho
    for (const item of cartCombo.combo_items) {
        const requiredQuantity = item.so_luong * so_luong;
        if (item.san_pham.so_luong < requiredQuantity) {
            throw new CustomError(
                `Sản phẩm "${item.san_pham.ten_san_pham}" chỉ còn ${item.san_pham.so_luong}`,
                400
            );
        }
    }

    return prisma.gio_hang_combo.update({
        where: { id: parseInt(id) },
        data: { so_luong },
        include: {
            combo_items: {
                include: {
                    san_pham: {
                        select: {
                            id: true,
                            ten_san_pham: true,
                            ma_san_pham: true,
                            gia_ban: true,
                            hinh_anh: true
                        }
                    }
                }
            }
        }
    });
};

// ------------------------------------------
// 8. Xóa combo khỏi giỏ hàng
// ------------------------------------------
exports.removeComboFromCart = async (id, customerId) => {
    const result = await prisma.gio_hang_combo.deleteMany({
        where: { id: parseInt(id), id_khach_hang: customerId }
    });
    return { deleted: result.count > 0 };
};