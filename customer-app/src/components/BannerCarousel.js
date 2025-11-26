import React, { useState, useEffect } from 'react';
import { Carousel, Button, Typography, Spin } from 'antd';
import { 
  ShoppingCartOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  SafetyOutlined,
  GiftOutlined,
  RocketOutlined,
  StarOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { storefrontAPI, API_URL } from '../utils/api';
import './BannerCarousel.css';

const { Title, Paragraph } = Typography;

const BannerCarousel = ({ onCartUpdate }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const baseHost = API_URL.replace(/\/api$/, '');
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${baseHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    fetchBannerData();
  }, []);

  const fetchBannerData = async () => {
    try {
      setLoading(true);
      
      // Fetch products for different banner types
      const [featuredResponse, newResponse, bestSellersResponse, discountResponse] = await Promise.all([
        storefrontAPI.getProducts({ limit: 3 }),
        storefrontAPI.getProducts({ limit: 3, sortBy: 'ngay_tao', sortOrder: 'desc' }),
        storefrontAPI.getProducts({ limit: 3, sortBy: 'so_luong', sortOrder: 'desc' }),
        storefrontAPI.getProducts({ limit: 3, sortBy: 'gia_ban', sortOrder: 'asc' })
      ]);

      // Create 6 banners with real data
      const bannerData = [
        {
          id: 1,
          type: 'gradient-purple',
          title: 'Mua Sắm Thông Minh',
          subtitle: 'Hàng ngàn sản phẩm chất lượng - Giá tốt nhất thị trường',
          badge: '🔥 KHUYẾN MÃI HOT',
          products: featuredResponse.data.items || [],
          primaryAction: 'Mua Ngay',
          secondaryAction: 'Khám Phá',
          features: [
            { icon: <ClockCircleOutlined />, title: 'Giao hàng nhanh', desc: '15-30 phút' },
            { icon: <TruckOutlined />, title: 'Miễn phí ship', desc: 'Đơn từ 100k' },
            { icon: <SafetyOutlined />, title: 'An toàn', desc: '100% chính hãng' },
            { icon: <GiftOutlined />, title: 'Ưu đãi', desc: 'Hàng ngày' }
          ]
        },
        {
          id: 2,
          type: 'neon-cyberpunk',
          title: 'TECH FUTURE',
          subtitle: 'Công nghệ tương lai - Giá hiện tại',
          badge: '⚡ SIÊU TỐC',
          products: newResponse.data.items || [],
          primaryAction: 'Khám Phá Ngay',
          features: [
            { icon: <RocketOutlined />, title: 'Sản phẩm mới', desc: 'Cập nhật hàng ngày' },
            { icon: <StarOutlined />, title: 'Chất lượng cao', desc: 'Được tin dùng' },
            { icon: <ThunderboltOutlined />, title: 'Giao hàng nhanh', desc: 'Trong 30 phút' }
          ]
        },
        {
          id: 3,
          type: 'minimalist-orange',
          title: 'GIẢM SỐC',
          subtitle: 'Flash Sale - Số lượng có hạn',
          badge: '⚡ FLASH SALE',
          products: discountResponse.data.items || [],
          primaryAction: 'Mua Ngay - Số Lượng Có Hạn',
          priceTag: {
            oldPrice: '2.999.000đ',
            newPrice: '1.499.000đ'
          }
        },
        {
          id: 4,
          type: 'dark-luxury',
          title: 'Premium Collection',
          subtitle: 'Sang trọng - Đẳng cấp - Độc quyền',
          badge: '👑 CAO CẤP',
          products: bestSellersResponse.data.items || [],
          primaryAction: 'Xem Bộ Sưu Tập',
          features: [
            { icon: <CrownOutlined />, title: 'Sản phẩm cao cấp', desc: 'Chất lượng tuyệt vời' },
            { icon: <TrophyOutlined />, title: 'Bán chạy nhất', desc: 'Được yêu thích' },
            { icon: <StarOutlined />, title: 'Đánh giá cao', desc: '5 sao từ khách hàng' }
          ]
        },
        {
          id: 5,
          type: 'fresh-green',
          title: 'Tươi Mới Mỗi Ngày',
          subtitle: '100% tự nhiên - An toàn cho sức khỏe',
          badge: '🌱 ORGANIC',
          products: featuredResponse.data.items || [],
          primaryAction: 'Đặt Hàng Ngay',
          features: [
            { icon: <CheckCircleOutlined />, title: 'Tự nhiên', desc: '100% organic' },
            { icon: <SafetyOutlined />, title: 'An toàn', desc: 'Tốt cho sức khỏe' },
            { icon: <HeartOutlined />, title: 'Yêu thương', desc: 'Gia đình bạn' }
          ]
        },
        {
          id: 6,
          type: 'tech-blue',
          title: 'Đột Phá Công Nghệ',
          subtitle: 'Trải nghiệm mua sắm thông minh',
          badge: '🚀 CÔNG NGHỆ',
          products: newResponse.data.items || [],
          primaryAction: 'Trải Nghiệm Ngay',
          features: [
            { icon: <TruckOutlined />, title: 'Giao hàng siêu tốc', desc: 'Trong 2h' },
            { icon: <SafetyOutlined />, title: 'Bảo hành chính hãng', desc: '12 tháng' },
            { icon: <DollarOutlined />, title: 'Hoàn tiền 100%', desc: 'Nếu không hài lòng' }
          ]
        }
      ];

      setBanners(bannerData);
    } catch (error) {
      console.error('Fetch banner data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (product) => {
    // Add to cart logic here
    onCartUpdate(1);
  };

  const renderProductCard = (product, index) => {
    if (!product) return null;
    
    return (
      <div key={product.id} className="product-card">
        <div className="discount-badge">
          -{Math.floor(Math.random() * 50) + 10}%
        </div>
        <div className="product-img">
          {product.hinh_anh ? (
            <img src={getImageUrl(product.hinh_anh)} alt={product.ten_san_pham} />
          ) : (
            <div className="product-emoji">
              {['🎧', '📱', '⌚', '💻', '🎮', '📷'][index % 6]}
            </div>
          )}
        </div>
        <div className="product-name">{product.ten_san_pham}</div>
        <div className="product-price">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(product.gia_ban)}
        </div>
        <div className="product-actions">
          <Button 
            type="primary" 
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(product);
            }}
          >
            Xem
          </Button>
          <Button 
            type="default" 
            size="small"
            icon={<ShoppingCartOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
          >
            Mua
          </Button>
        </div>
      </div>
    );
  };

  const renderBanner = (banner) => {
    return (
      <div key={banner.id} className={`banner-container banner-${banner.type}`}>
        {/* Content */}
        <div className="content">
          <div className="left-content">
            <div className="badge">{banner.badge}</div>
            <Title level={1} className="main-title">
              {banner.title}
            </Title>
            <Paragraph className="subtitle">
              {banner.subtitle}
            </Paragraph>
            
            {/* Price Tag for Flash Sale */}
            {banner.priceTag && (
              <div className="price-tag">
                <span className="old-price">{banner.priceTag.oldPrice}</span>
                <span className="new-price">{banner.priceTag.newPrice}</span>
              </div>
            )}

            {/* Features */}
            {banner.features && (
              <div className="features-list">
                {banner.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-text">
                      <div className="feature-title">{feature.title}</div>
                      <div className="feature-desc">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="cta-buttons">
              <Button 
                type="primary" 
                size="large"
                className="btn-primary"
                onClick={() => navigate('/products')}
              >
                {banner.primaryAction}
              </Button>
              {banner.secondaryAction && (
                <Button 
                  size="large"
                  className="btn-secondary"
                  onClick={() => navigate('/products')}
                >
                  {banner.secondaryAction}
                </Button>
              )}
            </div>
          </div>

          {/* Product Showcase */}
          <div className="right-content">
            <div className="product-showcase">
              {banner.products.slice(0, 3).map((product, index) => renderProductCard(product, index))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Đang tải banner...</p>
      </div>
    );
  }

  return (
    <div className="banner-carousel-container">
      <Carousel 
        autoplay 
        autoplaySpeed={5000}
        effect="fade"
        dots={{ 
          className: 'custom-dots',
          size: 'large'
        }}
        className="banner-carousel"
      >
        {banners.map(renderBanner)}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;