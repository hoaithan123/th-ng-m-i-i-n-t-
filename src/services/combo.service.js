// services/combo.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CustomError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

// ------------------------------------------
// 1. Lấy danh sách combo
// ------------------------------------------
exports.getAllCombos = async () => {
    return prisma.combo.findMany({
        where: { trang_thai: true },
        include: {
            combo_item: {
                include: {
                    san_pham: {
                        select: {
                            id: true,
                            ten_san_pham: true,
                            ma_san_pham: true,
                            gia_ban: true,
                            hinh_anh: true,
                            don_vi_tinh: true,
                            so_luong: true
                        }
                    }
                }
            }
        },
        orderBy: { ngay_tao: 'desc' }
    });
};

// ------------------------------------------
// 2. Lấy chi tiết combo
// ------------------------------------------
exports.getComboById = async (id) => {
    const combo = await prisma.combo.findUnique({
        where: { id: parseInt(id) },
        include: {
            combo_item: {
                include: {
                    san_pham: {
                        select: {
                            id: true,
                            ten_san_pham: true,
                            ma_san_pham: true,
                            gia_ban: true,
                            hinh_anh: true,
                            don_vi_tinh: true,
                            so_luong: true
                        }
                    }
                }
            }
        }
    });

    if (!combo) {
        throw new CustomError('Combo không tồn tại', 404);
    }

    return combo;
};

// ------------------------------------------
// 3. Thêm combo vào giỏ hàng (thêm tất cả sản phẩm trong combo)
// ------------------------------------------
exports.addComboToCart = async (customerId, comboId, so_luong) => {
    const quantity = Number(so_luong) || 1;
    if (quantity < 1) {
        throw new CustomError('Số lượng không hợp lệ', 400);
    }

    // Lấy thông tin combo
    const combo = await prisma.combo.findUnique({
        where: { id: parseInt(comboId) },
        include: {
            combo_item: {
                include: {
                    san_pham: true
                }
            }
        }
    });

    if (!combo) {
        throw new CustomError('Combo không tồn tại', 404);
    }

    if (!combo.trang_thai) {
        throw new CustomError('Combo không khả dụng', 400);
    }

    if (combo.combo_item.length === 0) {
        throw new CustomError('Combo không có sản phẩm', 400);
    }

    // Kiểm tra tồn kho cho tất cả sản phẩm trong combo
    for (const item of combo.combo_item) {
        const requiredQuantity = item.so_luong * quantity;
        if (item.san_pham.so_luong < requiredQuantity) {
            throw new CustomError(
                `Sản phẩm "${item.san_pham.ten_san_pham}" trong combo chỉ còn ${item.san_pham.so_luong} ${item.san_pham.don_vi_tinh}, cần ${requiredQuantity}`,
                400
            );
        }
    }

    // Tính giá combo (nếu có giá riêng thì dùng, không thì tính từ tổng giá sản phẩm)
    let comboPrice = combo.gia_ban ? Number(combo.gia_ban) : 0;
    if (!comboPrice || comboPrice === 0) {
        comboPrice = combo.combo_item.reduce((total, item) => {
            return total + (Number(item.san_pham.gia_ban) * item.so_luong);
        }, 0);
    }

    // Thêm combo vào giỏ hàng như 1 item duy nhất
    return prisma.$transaction(async (tx) => {
        const cartCombo = await tx.gio_hang_combo.create({
            data: {
                id_khach_hang: Number(customerId),
                ten_combo: combo.ten_combo,
                gia_ban: comboPrice.toFixed(2),
                so_luong: quantity,
                combo_items: {
                    create: combo.combo_item.map(item => ({
                        id_san_pham: item.id_san_pham,
                        ten_san_pham: item.san_pham.ten_san_pham,
                        so_luong: item.so_luong,
                        don_gia: Number(item.san_pham.gia_ban).toFixed(2)
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

        return {
            combo: {
                id: combo.id,
                ten_combo: combo.ten_combo
            },
            cartCombo
        };
    });
};

// ------------------------------------------
// 4. [ADMIN] Tạo combo mới
// ------------------------------------------
exports.createCombo = async (data) => {
    const { ten_combo, mo_ta, gia_ban, hinh_anh, items } = data;

    if (!ten_combo || !items || !Array.isArray(items) || items.length === 0) {
        throw new CustomError('Vui lòng điền đầy đủ thông tin combo và sản phẩm', 400);
    }

    // Validate items
    for (const item of items) {
        if (!item.id_san_pham || !item.so_luong || item.so_luong < 1) {
            throw new CustomError('Thông tin sản phẩm trong combo không hợp lệ', 400);
        }

        const product = await prisma.san_pham.findUnique({
            where: { id: item.id_san_pham }
        });

        if (!product) {
            throw new CustomError(`Sản phẩm ID ${item.id_san_pham} không tồn tại`, 400);
        }
    }

    return prisma.$transaction(async (tx) => {
        // Tạo combo
        const combo = await tx.combo.create({
            data: {
                ten_combo,
                mo_ta: mo_ta || null,
                gia_ban: gia_ban ? parseFloat(gia_ban).toFixed(2) : null,
                hinh_anh: hinh_anh || null,
                combo_item: {
                    create: items.map(item => ({
                        id_san_pham: item.id_san_pham,
                        so_luong: item.so_luong
                    }))
                }
            },
            include: {
                combo_item: {
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

        return combo;
    });
};

// ------------------------------------------
// 5. [ADMIN] Cập nhật combo
// ------------------------------------------
exports.updateCombo = async (id, data) => {
    const combo = await prisma.combo.findUnique({
        where: { id: parseInt(id) }
    });

    if (!combo) {
        throw new CustomError('Combo không tồn tại', 404);
    }

    const { ten_combo, mo_ta, gia_ban, hinh_anh, trang_thai, items } = data;

    return prisma.$transaction(async (tx) => {
        // Cập nhật thông tin combo
        const updateData = {};
        if (ten_combo !== undefined) updateData.ten_combo = ten_combo;
        if (mo_ta !== undefined) updateData.mo_ta = mo_ta;
        if (gia_ban !== undefined) updateData.gia_ban = gia_ban ? parseFloat(gia_ban).toFixed(2) : null;
        if (hinh_anh !== undefined) updateData.hinh_anh = hinh_anh;
        if (trang_thai !== undefined) updateData.trang_thai = trang_thai;

        const updatedCombo = await tx.combo.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        // Nếu có items, cập nhật lại
        if (items && Array.isArray(items)) {
            // Xóa items cũ
            await tx.combo_item.deleteMany({
                where: { id_combo: parseInt(id) }
            });

            // Thêm items mới
            if (items.length > 0) {
                await tx.combo_item.createMany({
                    data: items.map(item => ({
                        id_combo: parseInt(id),
                        id_san_pham: item.id_san_pham,
                        so_luong: item.so_luong
                    }))
                });
            }
        }

        return tx.combo.findUnique({
            where: { id: parseInt(id) },
            include: {
                combo_item: {
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
    });
};

// ------------------------------------------
// 6. [ADMIN] Xóa combo
// ------------------------------------------
exports.deleteCombo = async (id) => {
    const combo = await prisma.combo.findUnique({
        where: { id: parseInt(id) }
    });

    if (!combo) {
        throw new CustomError('Combo không tồn tại', 404);
    }

    await prisma.combo.delete({
        where: { id: parseInt(id) }
    });

    return { message: 'Đã xóa combo' };
};

