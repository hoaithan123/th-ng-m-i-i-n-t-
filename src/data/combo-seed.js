// File: src/data/combo-seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const comboData = [
  {
    ten_combo: 'Combo văn phòng',
    mo_ta: 'Snack + nước + cà phê tiện lợi cho dân văn phòng',
    gia_ban: 89000,
    hinh_anh: null,
    items: [
      { id_san_pham: null, so_luong: 1 }, // Sẽ được cập nhật sau
      { id_san_pham: null, so_luong: 1 },
      { id_san_pham: null, so_luong: 1 }
    ]
  },
  {
    ten_combo: 'Combo tăng ca đêm',
    mo_ta: 'Mì ly nóng + nước giải khát cho buổi tăng ca',
    gia_ban: 69000,
    hinh_anh: null,
    items: [
      { id_san_pham: null, so_luong: 1 },
      { id_san_pham: null, so_luong: 1 }
    ]
  },
  {
    ten_combo: 'Combo gia đình cuối tuần',
    mo_ta: 'Snack, sữa, đồ đông lạnh cho cả nhà',
    gia_ban: 149000,
    hinh_anh: null,
    items: [
      { id_san_pham: null, so_luong: 2 },
      { id_san_pham: null, so_luong: 1 },
      { id_san_pham: null, so_luong: 1 }
    ]
  },
  {
    ten_combo: 'Combo ăn sáng',
    mo_ta: 'Bánh mì + sữa + trứng cho bữa sáng đầy đủ',
    gia_ban: 55000,
    hinh_anh: null,
    items: [
      { id_san_pham: null, so_luong: 1 },
      { id_san_pham: null, so_luong: 1 },
      { id_san_pham: null, so_luong: 1 }
    ]
  },
  {
    ten_combo: 'Combo giải khát',
    mo_ta: 'Nước ngọt + nước suối + trà đá',
    gia_ban: 45000,
    hinh_anh: null,
    items: [
      { id_san_pham: null, so_luong: 1 },
      { id_san_pham: null, so_luong: 1 },
      { id_san_pham: null, so_luong: 1 }
    ]
  },
  {
    ten_combo: 'Combo snack vặt',
    mo_ta: 'Bim bim + kẹo + bánh quy cho buổi xế',
    gia_ban: 65000,
    hinh_anh: null,
    items: [
      { id_san_pham: null, so_luong: 2 },
      { id_san_pham: null, so_luong: 1 },
      { id_san_pham: null, so_luong: 1 }
    ]
  },
  {
    ten_combo: 'Combo mì gói',
    mo_ta: '3 mì gói các loại + trứng + xúc xích',
    gia_ban: 75000,
    hinh_anh: null,
    items: [
      { id_san_pham: null, so_luong: 3 },
      { id_san_pham: null, so_luong: 2 },
      { id_san_pham: null, so_luong: 1 }
    ]
  },
  {
    ten_combo: 'Combo đồ uống',
    mo_ta: 'Cà phê + nước ngọt + nước suối',
    gia_ban: 85000,
    hinh_anh: null,
    items: [
      { id_san_pham: null, so_luong: 1 },
      { id_san_pham: null, so_luong: 1 },
      { id_san_pham: null, so_luong: 1 }
    ]
  }
];

async function seedCombos() {
  try {
    console.log('🌱 Bắt đầu seed combo data...');
    
    // Xóa combo cũ
    await prisma.combo_item.deleteMany();
    await prisma.combo.deleteMany();
    
    // Lấy danh sách sản phẩm
    const products = await prisma.san_pham.findMany({
      where: { so_luong: { gt: 0 } },
      take: 50
    });
    
    if (products.length < 3) {
      console.log('⚠️ Không đủ sản phẩm để tạo combo. Cần ít nhất 3 sản phẩm.');
      return;
    }
    
    // Tạo combo với sản phẩm ngẫu nhiên
    for (let i = 0; i < comboData.length; i++) {
      const comboInfo = comboData[i];
      const numItems = comboInfo.items.length;
      
      // Chọn sản phẩm ngẫu nhiên
      const selectedProducts = [];
      const usedIndices = new Set();
      for (let j = 0; j < numItems; j++) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * products.length);
        } while (usedIndices.has(randomIndex));
        usedIndices.add(randomIndex);
        selectedProducts.push(products[randomIndex]);
      }
      
      // Tạo combo
      const combo = await prisma.combo.create({
        data: {
          ten_combo: comboInfo.ten_combo,
          mo_ta: comboInfo.mo_ta,
          gia_ban: comboInfo.gia_ban,
          hinh_anh: comboInfo.hinh_anh,
          combo_item: {
            create: selectedProducts.map((product, idx) => ({
              id_san_pham: product.id,
              so_luong: comboInfo.items[idx].so_luong
            }))
          }
        }
      });
      
      console.log(`✅ Đã tạo combo: ${combo.ten_combo} (${selectedProducts.length} sản phẩm)`);
    }
    
    console.log('🎉 Hoàn thành seed combo data!');
    console.log(`📊 Đã tạo ${comboData.length} combo`);
    
  } catch (error) {
    console.error('❌ Lỗi khi seed combo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy seed nếu file được gọi trực tiếp
if (require.main === module) {
  seedCombos();
}

module.exports = { seedCombos };

