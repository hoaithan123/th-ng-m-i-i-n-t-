import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Tag, Space, Progress, Badge, Countdown, Tooltip, message } from 'antd';
import { 
  FireOutlined, 
  ThunderboltOutlined, 
  GiftOutlined, 
  StarOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  SafetyOutlined,
  CrownOutlined,
  RocketOutlined,
  TrophyOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  EyeOutlined,
  UserOutlined,
  GlobalOutlined,
  BarChartOutlined,
  TrendingUpOutlined,
  BellOutlined,
  AlertOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { storefrontAPI, API_URL, cartAPI } from '../utils/api';
import './SpecialOffersBanner.css';

const { Title, Paragraph } = Typography;

const SpecialOffersBanner = ({ onCartUpdate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const navigate = useNavigate();

  const baseHost = API_URL.replace(/\/api$/, '');
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${baseHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    fetchSpecialOffersData();
    startCountdown();
  }, []);

  const fetchSpecialOffersData = async () => {
    try {
      setLoading(true);
      
      // Fetch products for special offers
      const response = await storefrontAPI.getProducts({ 
        limit: 8,
        sortBy: 'gia_ban',
        sortOrder: 'asc'
      });
      
      setProducts(response.data.items || []);
    } catch (error) {
      console.error('Fetch special offers data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    // Set countdown to 24 hours from now
    const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;
      
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
  };

  const specialOffers = [
    {
      id: 1,
      type: 'flash-sale',
      title: 'FLASH SALE 24H',
      subtitle: 'Giảm giá sốc - Số lượng có hạn',
      badge: '⚡ SIÊU HOT',
      discount: '70%',
      products: products.slice(0, 4),
      countdown: true
    },
    {
      id: 2,
      type: 'premium-deal',
      title: 'DEAL CAO CẤP',
      subtitle: 'Sản phẩm cao cấp với giá tốt nhất',
      badge: '👑 PREMIUM',
      discount: '50%',
      products: products.slice(4, 8),
      countdown: false
    }
  ];

  const handleProductClick = (e, product) => {
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    const token = localStorage.getItem('customerToken');
    if (!token) {
      message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    try {
      await cartAPI.addToCart({
        id_san_pham: product.id,
        so_luong: 1
      });
      message.success('Đã thêm sản phẩm vào giỏ hàng!');
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra!');
    }
  };

  const renderSpecialOffer = (offer) => {
    return (
      <Card key={offer.id} className={`special-offer-card ${offer.type}`}>
        <div className="offer-header">
          <div className="offer-badge">
            <Tag color="red" className="badge-tag">
              {offer.badge}
            </Tag>
          </div>
          <div className="offer-header-text">
            <Title level={3} className="offer-title">
              {offer.title}
            </Title>
            <Paragraph className="offer-subtitle">
              {offer.subtitle}
            </Paragraph>
          </div>
        </div>

        <div className="offer-content">
          <div className="products-section">
            <div className="products-grid">
              {offer.products.slice(0, 4).map((product, index) => (
                <div key={product.id} className="offer-product">
                  <div className="product-image">
                    {product.hinh_anh ? (
                      <img src={getImageUrl(product.hinh_anh)} alt={product.ten_san_pham} />
                    ) : (
                      <div className="product-emoji">
                        {['📱', '🎧', '⌚', '💻', '🎮', '📷'][index]}
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.ten_san_pham}</div>
                    <div className="product-price">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(product.gia_ban)}
                    </div>
                    <div className="product-rating">
                      <StarOutlined style={{ color: '#faad14' }} />
                      <span>4.8</span>
                      <span className="rating-count">(128)</span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <Button 
                      type="primary" 
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => handleProductClick(e, product)}
                    >
                      Xem
                    </Button>
                    <Button 
                      size="small"
                      icon={<ShoppingCartOutlined />}
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      Mua
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="offer-footer">
            <Button 
              type="primary" 
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/products')}
              className="offer-cta"
            >
              Mua Ngay - Ưu Đãi Có Hạn
            </Button>
          </div>
        </div>

      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="loading-spinner">Đang tải ưu đãi đặc biệt...</div>
      </div>
    );
  }

  return (
    <div className="special-offers-container">
      <div className="section-header">
        <Title level={2} className="section-title">
          🔥 Ưu Đãi Đặc Biệt Hôm Nay
        </Title>
        <Paragraph className="section-subtitle">
          Cơ hội vàng để sở hữu những sản phẩm chất lượng với giá tốt nhất
        </Paragraph>
      </div>

      <div className="offers-grid">
        {specialOffers.map(renderSpecialOffer)}
      </div>
    </div>
  );
};

export default SpecialOffersBanner;

