# 🎨 Banner Quảng Cáo Động - Customer App

## Tổng quan
Hệ thống banner quảng cáo động với dữ liệu thật từ backend, bao gồm các hiệu ứng tương tác, video quảng cáo và ưu đãi đặc biệt.

## 🚀 Các Component Banner Mới

### 1. BannerCarousel - Banner Carousel Động
**File:** `src/components/BannerCarousel.js`

**Tính năng:**
- 6 loại banner với thiết kế khác nhau
- Sử dụng dữ liệu sản phẩm thật từ API
- Hiệu ứng animation đa dạng
- Responsive design
- Tự động chuyển slide

**Loại banner:**
- **Gradient Purple/Pink**: Banner chính với hiệu ứng float
- **Neon Cyberpunk**: Thiết kế tương lai với hiệu ứng neon
- **Minimalist Orange**: Flash sale với hình học động
- **Dark Luxury**: Sản phẩm cao cấp với hiệu ứng vàng
- **Fresh Green**: Sản phẩm tự nhiên với hiệu ứng sóng
- **Tech Blue**: Công nghệ với hiệu ứng dot matrix

### 2. VideoBanner - Banner Video Tương Tác
**File:** `src/components/VideoBanner.js`

**Tính năng:**
- Video quảng cáo với controls tương tác
- Modal xem video chi tiết
- Sản phẩm showcase trong video
- Play/Pause/Mute/Fullscreen controls
- Responsive video player

**Loại video banner:**
- **Trải Nghiệm Tương Lai**: AI, giao hàng siêu tốc
- **Chất Lượng Cao**: Sản phẩm chính hãng, bảo hành

### 3. InteractiveBanner - Banner Tương Tác Thông Minh
**File:** `src/components/InteractiveBanner.js`

**Tính năng:**
- Floating cards với hiệu ứng hover
- Parallax scrolling effects
- Live stats animation
- Interactive product cards
- Particle effects

**Loại banner tương tác:**
- **Floating Cards**: Sản phẩm nổi bật với hiệu ứng bay
- **Parallax Scroll**: Công nghệ tương lai với parallax

### 4. SpecialOffersBanner - Ưu Đãi Đặc Biệt
**File:** `src/components/SpecialOffersBanner.js`

**Tính năng:**
- Countdown timer thời gian thực
- Flash sale với giảm giá sốc
- Premium deals với sản phẩm cao cấp
- Progress indicators
- Limited quantity warnings

**Loại ưu đãi:**
- **Flash Sale 24H**: Giảm giá 70%, countdown timer
- **Premium Deal**: Sản phẩm cao cấp giảm 50%

## 🎯 Tính Năng Chính

### Dữ Liệu Thật
- Tất cả banner sử dụng sản phẩm thật từ API
- Giá cả, hình ảnh, tên sản phẩm từ database
- Cập nhật real-time khi có sản phẩm mới

### Hiệu Ứng Động
- **CSS Animations**: Float, pulse, scale, rotate
- **Hover Effects**: Transform, shadow, glow
- **Particle Systems**: Sparkles, dots, circles
- **Gradient Backgrounds**: Multi-color gradients
- **Backdrop Filters**: Blur effects

### Tương Tác Người Dùng
- **Click to View**: Xem chi tiết sản phẩm
- **Add to Cart**: Thêm vào giỏ hàng
- **Video Controls**: Play, pause, mute, fullscreen
- **Modal Interactions**: Xem video chi tiết
- **Hover States**: Hiệu ứng khi hover

### Responsive Design
- **Mobile First**: Tối ưu cho mobile
- **Tablet Support**: Layout phù hợp tablet
- **Desktop Enhanced**: Hiệu ứng đầy đủ trên desktop
- **Touch Friendly**: Dễ dàng tương tác trên touch

## 🛠️ Cách Sử Dụng

### 1. Import Component
```javascript
import BannerCarousel from '../components/BannerCarousel';
import VideoBanner from '../components/VideoBanner';
import InteractiveBanner from '../components/InteractiveBanner';
import SpecialOffersBanner from '../components/SpecialOffersBanner';
```

### 2. Sử dụng trong Component
```javascript
const Home = ({ onCartUpdate }) => {
  return (
    <div className="home-page">
      <BannerCarousel onCartUpdate={onCartUpdate} />
      <VideoBanner onCartUpdate={onCartUpdate} />
      <InteractiveBanner onCartUpdate={onCartUpdate} />
      <SpecialOffersBanner onCartUpdate={onCartUpdate} />
    </div>
  );
};
```

### 3. Props
- `onCartUpdate`: Function để cập nhật số lượng giỏ hàng

## 🎨 Customization

### Thay Đổi Màu Sắc
```css
/* BannerCarousel.css */
.banner-gradient-purple {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}
```

### Thay Đổi Animation
```css
/* Thay đổi tốc độ animation */
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.1); }
}
```

### Thêm Banner Mới
1. Tạo object banner mới trong array `banners`
2. Thêm CSS cho loại banner mới
3. Cập nhật logic render

## 📱 Responsive Breakpoints

### Mobile (< 768px)
- Banner height: 400px → 300px
- Font sizes: Giảm 20-30%
- Product cards: 1 column
- Video controls: Simplified

### Tablet (768px - 1024px)
- Banner height: 400px
- Product cards: 2-3 columns
- Features: 2 columns

### Desktop (> 1024px)
- Banner height: 500px
- Product cards: 4+ columns
- Full animations enabled
- All features visible

## 🔧 API Integration

### Endpoints Sử Dụng
```javascript
// Lấy sản phẩm nổi bật
storefrontAPI.getProducts({ 
  limit: 8,
  inStock: 'false'
});

// Lấy sản phẩm mới
storefrontAPI.getProducts({ 
  limit: 6,
  sortBy: 'ngay_tao',
  sortOrder: 'desc'
});

// Lấy sản phẩm bán chạy
storefrontAPI.getProducts({ 
  limit: 6,
  sortBy: 'so_luong',
  sortOrder: 'desc'
});
```

### Data Structure
```javascript
const product = {
  id: 1,
  ten_san_pham: "Tên sản phẩm",
  gia_ban: 100000,
  hinh_anh: "url-to-image",
  so_luong: 100,
  ngay_tao: "2024-01-01"
};
```

## 🎯 Performance Optimization

### Lazy Loading
- Components chỉ load khi cần thiết
- Images lazy load với intersection observer
- Video chỉ load khi user tương tác

### Animation Performance
- Sử dụng `transform` và `opacity` cho animation
- Tránh `width`, `height` trong animation
- Hardware acceleration với `will-change`

### Memory Management
- Cleanup timers và intervals
- Remove event listeners khi unmount
- Optimize re-renders với useMemo/useCallback

## 🐛 Troubleshooting

### Banner Không Hiển Thị
1. Kiểm tra API response
2. Verify component import
3. Check CSS file loading

### Animation Laggy
1. Reduce animation complexity
2. Use `transform` instead of position changes
3. Enable hardware acceleration

### Video Không Play
1. Check video URL validity
2. Verify browser video support
3. Check CORS settings

## 🚀 Future Enhancements

### Tính Năng Có Thể Thêm
- [ ] A/B testing cho banner
- [ ] Personalization dựa trên user behavior
- [ ] Real-time inventory updates
- [ ] Social sharing integration
- [ ] Analytics tracking
- [ ] Multi-language support
- [ ] Dark mode support
- [ ] Voice interaction

### Technical Improvements
- [ ] WebGL animations
- [ ] 3D product showcases
- [ ] AR/VR integration
- [ ] Machine learning recommendations
- [ ] Progressive Web App features

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: $(date)  
**Tác giả**: AI Assistant  
**Framework**: React + Ant Design + CSS3

