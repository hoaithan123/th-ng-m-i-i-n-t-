import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Tag, Space, Progress, Badge, Tooltip } from 'antd';
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
  TrendingUpOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { storefrontAPI, API_URL } from '../utils/api';
import './InteractiveBanner.css';

const { Title, Paragraph } = Typography;

const InteractiveBanner = ({ onCartUpdate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    customers: 0,
    orders: 0,
    products: 0,
    rating: 0
  });
  const navigate = useNavigate();

  const baseHost = API_URL.replace(/\/api$/, '');
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${baseHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    fetchInteractiveData();
    animateStats();
  }, []);

  const fetchInteractiveData = async () => {
    try {
      setLoading(true);
      
      // Fetch products for interactive banners
      const response = await storefrontAPI.getProducts({ 
        limit: 8,
        inStock: true
      });
      
      setProducts(response.data.items || []);
    } catch (error) {
      console.error('Fetch interactive data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateStats = () => {
    const targetStats = {
      customers: 15000,
      orders: 850,
      products: 1250,
      rating: 4.8
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        customers: Math.floor(targetStats.customers * progress),
        orders: Math.floor(targetStats.orders * progress),
        products: Math.floor(targetStats.products * progress),
        rating: Number((targetStats.rating * progress).toFixed(1))
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(targetStats);
      }
    }, stepDuration);
  };

  const interactiveBanners = [
    {
      id: 1,
      type: 'floating-cards',
      title: 'Sản Phẩm Nổi Bật',
      subtitle: 'Khám phá những sản phẩm được yêu thích nhất',
      products: products.slice(0, 4),
      features: [
        { icon: <StarOutlined />, title: 'Đánh giá cao', value: '4.8/5' },
        { icon: <TrophyOutlined />, title: 'Bán chạy', value: '1000+' },
        { icon: <HeartOutlined />, title: 'Yêu thích', value: '500+' }
      ]
    },
    {
      id: 2,
      type: 'parallax-scroll',
      title: 'Công Nghệ Tương Lai',
      subtitle: 'Trải nghiệm mua sắm với AI và công nghệ tiên tiến',
      products: products.slice(4, 8),
      features: [
        { icon: <RocketOutlined />, title: 'AI Tư vấn', value: '24/7' },
        { icon: <ThunderboltOutlined />, title: 'Giao hàng', value: '15 phút' },
        { icon: <GlobalOutlined />, title: 'Toàn cầu', value: '50+ quốc gia' }
      ]
    }
  ];

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (product) => {
    onCartUpdate(1);
  };

  const renderFloatingCard = (product, index) => {
    const isHovered = hoveredCard === product.id;
    
    return (
      <div 
        key={product.id}
        className={`floating-card card-${index + 1} ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredCard(product.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => handleProductClick(product)}
      >
        <div className="card-glow"></div>
        <div className="card-content">
          <div className="product-image">
            {product.hinh_anh ? (
              <img src={getImageUrl(product.hinh_anh)} alt={product.ten_san_pham} />
            ) : (
              <div className="product-emoji">
                {['📱', '🎧', '⌚', '💻'][index]}
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
              <span>4.{Math.floor(Math.random() * 9) + 1}</span>
            </div>
          </div>
          <div className="card-actions">
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
        <div className="card-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>
    );
  };

  const renderParallaxCard = (product, index) => {
    return (
      <div 
        key={product.id}
        className={`parallax-card parallax-${index + 1}`}
        onClick={() => handleProductClick(product)}
      >
        <div className="parallax-bg"></div>
        <div className="parallax-content">
          <div className="product-image">
            {product.hinh_anh ? (
              <img src={getImageUrl(product.hinh_anh)} alt={product.ten_san_pham} />
            ) : (
              <div className="product-emoji">
                {['🎮', '📷', '🔊', '⌨️'][index]}
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
            <div className="discount-badge">
              -{Math.floor(Math.random() * 50) + 10}%
            </div>
          </div>
          <div className="parallax-overlay">
            <Button 
              type="primary" 
              size="small"
              icon={<ShoppingCartOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
            >
              Thêm vào giỏ
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderInteractiveBanner = (banner) => {
    return (
      <Card key={banner.id} className={`interactive-banner ${banner.type}`}>
        <div className="banner-header">
          <Title level={2} className="banner-title">
            {banner.title}
          </Title>
          <Paragraph className="banner-subtitle">
            {banner.subtitle}
          </Paragraph>
        </div>

        <div className="banner-content">
          <div className="products-section">
            {banner.type === 'floating-cards' ? (
              <div className="floating-cards-container">
                {banner.products.map((product, index) => renderFloatingCard(product, index))}
              </div>
            ) : (
              <div className="parallax-cards-container">
                {banner.products.map((product, index) => renderParallaxCard(product, index))}
              </div>
            )}
          </div>

          <div className="features-section">
            <div className="features-grid">
              {banner.features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <div className="feature-content">
                    <div className="feature-title">{feature.title}</div>
                    <div className="feature-value">{feature.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="banner-footer">
          <Button 
            type="primary" 
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={() => navigate('/products')}
            className="banner-cta"
          >
            Khám Phá Tất Cả
          </Button>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="loading-spinner">Đang tải dữ liệu tương tác...</div>
      </div>
    );
  }

  return (
    <div className="interactive-banner-container">
      <div className="section-header">
        <Title level={2} className="section-title">
          🎮 Banner Tương Tác Thông Minh
        </Title>
        <Paragraph className="section-subtitle">
          Trải nghiệm mua sắm với các hiệu ứng động và tương tác đặc biệt
        </Paragraph>
      </div>

      {/* Live Stats */}
      <div className="live-stats-section">
        <Row gutter={[24, 24]}>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <div className="stat-icon">
                <UserOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-number">{animatedStats.customers.toLocaleString()}</div>
                <div className="stat-label">Khách hàng</div>
                <Progress 
                  percent={100} 
                  showInfo={false} 
                  strokeColor="#52c41a"
                  className="stat-progress"
                />
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <div className="stat-icon">
                <ShoppingCartOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-number">{animatedStats.orders}</div>
                <div className="stat-label">Đơn hàng/ngày</div>
                <Progress 
                  percent={100} 
                  showInfo={false} 
                  strokeColor="#1890ff"
                  className="stat-progress"
                />
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <div className="stat-icon">
                <TrophyOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-number">{animatedStats.products}</div>
                <div className="stat-label">Sản phẩm</div>
                <Progress 
                  percent={100} 
                  showInfo={false} 
                  strokeColor="#faad14"
                  className="stat-progress"
                />
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <div className="stat-icon">
                <StarOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-number">{animatedStats.rating}</div>
                <div className="stat-label">Đánh giá</div>
                <Progress 
                  percent={100} 
                  showInfo={false} 
                  strokeColor="#eb2f96"
                  className="stat-progress"
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Interactive Banners */}
      <div className="banners-grid">
        {interactiveBanners.map(renderInteractiveBanner)}
      </div>
    </div>
  );
};

export default InteractiveBanner;

