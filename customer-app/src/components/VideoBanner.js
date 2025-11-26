import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Row, Col, Tag, Space, Modal } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  SoundOutlined, 
  AudioMutedOutlined,
  FullscreenOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ShoppingCartOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { storefrontAPI, API_URL } from '../utils/api';
import './VideoBanner.css';

const { Title, Paragraph } = Typography;

const VideoBanner = ({ onCartUpdate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const baseHost = API_URL.replace(/\/api$/, '');
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${baseHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    fetchVideoData();
  }, []);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured products for video banners
      const response = await storefrontAPI.getProducts({ 
        limit: 6,
        inStock: true
      });
      
      setProducts(response.data.items || []);
    } catch (error) {
      console.error('Fetch video data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const videoBanners = [
    {
      id: 1,
      title: 'Trải Nghiệm Mua Sắm Tương Lai',
      subtitle: 'Công nghệ AI - Giao hàng siêu tốc - Thanh toán thông minh',
      badge: '🚀 TƯƠNG LAI',
      videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      posterUrl: 'https://via.placeholder.com/1280x720/667eea/ffffff?text=Future+Shopping',
      products: products.slice(0, 3),
      features: [
        { icon: '🤖', title: 'AI Tư vấn', desc: 'Trí tuệ nhân tạo' },
        { icon: '⚡', title: 'Giao hàng 15 phút', desc: 'Siêu tốc độ' },
        { icon: '💳', title: 'Thanh toán QR', desc: 'An toàn tuyệt đối' }
      ]
    },
    {
      id: 2,
      title: 'Sản Phẩm Chất Lượng Cao',
      subtitle: '100% chính hãng - Bảo hành toàn diện - Giá tốt nhất',
      badge: '⭐ CHẤT LƯỢNG',
      videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
      posterUrl: 'https://via.placeholder.com/1280x720/52c41a/ffffff?text=Quality+Products',
      products: products.slice(3, 6),
      features: [
        { icon: '🛡️', title: 'Chính hãng 100%', desc: 'Cam kết chất lượng' },
        { icon: '🔧', title: 'Bảo hành 12 tháng', desc: 'Hỗ trợ tận tình' },
        { icon: '💰', title: 'Giá tốt nhất', desc: 'Cạnh tranh thị trường' }
      ]
    }
  ];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoClick = (video) => {
    setCurrentVideo(video);
    setShowModal(true);
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (product) => {
    onCartUpdate(1);
  };

  const renderVideoBanner = (banner) => {
    return (
      <Card key={banner.id} className="video-banner-card" hoverable>
        <div className="video-container">
          <video
            ref={videoRef}
            className="banner-video"
            poster={banner.posterUrl}
            muted={isMuted}
            loop
            playsInline
            onClick={handlePlayPause}
          >
            <source src={banner.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Video Overlay */}
          <div className="video-overlay">
            <div className="video-content">
              <div className="video-badge">
                <Tag color="red" className="badge-tag">
                  {banner.badge}
                </Tag>
              </div>
              
              <Title level={1} className="video-title">
                {banner.title}
              </Title>
              
              <Paragraph className="video-subtitle">
                {banner.subtitle}
              </Paragraph>

              {/* Features */}
              <div className="video-features">
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

              {/* Action Buttons */}
              <Space size="large" className="video-actions">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => navigate('/products')}
                  className="action-btn-primary"
                >
                  Mua Sắm Ngay
                </Button>
                <Button 
                  size="large"
                  icon={<EyeOutlined />}
                  onClick={() => handleVideoClick(banner)}
                  className="action-btn-secondary"
                >
                  Xem Chi Tiết
                </Button>
              </Space>
            </div>

            {/* Video Controls */}
            <div className="video-controls">
              <Button 
                type="text" 
                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={handlePlayPause}
                className="control-btn"
              />
              <Button 
                type="text" 
                icon={isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
                onClick={handleMuteToggle}
                className="control-btn"
              />
              <Button 
                type="text" 
                icon={<FullscreenOutlined />}
                onClick={handleFullscreen}
                className="control-btn"
              />
            </div>

            {/* Product Showcase */}
            <div className="product-showcase">
              {banner.products.map((product, index) => (
                <div key={product.id} className="showcase-product">
                  <div className="product-image">
                    {product.hinh_anh ? (
                      <img src={getImageUrl(product.hinh_anh)} alt={product.ten_san_pham} />
                    ) : (
                      <div className="product-placeholder">
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
                    <div className="product-actions">
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => handleProductClick(product)}
                      >
                        Xem
                      </Button>
                      <Button 
                        size="small"
                        onClick={() => handleAddToCart(product)}
                      >
                        Mua
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="loading-spinner">Đang tải video...</div>
      </div>
    );
  }

  return (
    <div className="video-banner-container">
      <div className="section-header">
        <Title level={2} className="section-title">
          🎬 Video Quảng Cáo Động
        </Title>
        <Paragraph className="section-subtitle">
          Trải nghiệm mua sắm thông minh với công nghệ tiên tiến
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {videoBanners.map((banner, index) => (
          <Col xs={24} lg={12} key={banner.id}>
            {renderVideoBanner(banner)}
          </Col>
        ))}
      </Row>

      {/* Video Modal */}
      <Modal
        title={currentVideo?.title}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        className="video-modal"
      >
        {currentVideo && (
          <div className="modal-video-container">
            <video
              className="modal-video"
              controls
              autoPlay
              poster={currentVideo.posterUrl}
            >
              <source src={currentVideo.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            <div className="modal-content">
              <Title level={3}>{currentVideo.title}</Title>
              <Paragraph>{currentVideo.subtitle}</Paragraph>
              
              <div className="modal-features">
                {currentVideo.features.map((feature, index) => (
                  <div key={index} className="modal-feature">
                    <span className="modal-feature-icon">{feature.icon}</span>
                    <span className="modal-feature-text">
                      <strong>{feature.title}</strong> - {feature.desc}
                    </span>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => {
                    setShowModal(false);
                    navigate('/products');
                  }}
                >
                  Mua Sắm Ngay
                </Button>
                <Button 
                  size="large"
                  icon={<ShareAltOutlined />}
                >
                  Chia Sẻ
                </Button>
                <Button 
                  size="large"
                  icon={<HeartOutlined />}
                >
                  Yêu Thích
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoBanner;
