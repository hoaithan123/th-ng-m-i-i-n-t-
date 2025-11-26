import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Spin, Card, Typography, Space, Tag, Divider, Input, Badge, Statistic, Carousel, Tabs, Rate, Avatar, List, Alert, Skeleton, notification } from 'antd';
import { 
  FireOutlined, 
  ThunderboltOutlined, 
  GiftOutlined, 
  StarOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  SafetyOutlined,
  SearchOutlined,
  HeartOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CustomerServiceOutlined,
  TrophyOutlined,
  CrownOutlined,
  RocketOutlined,
  BulbOutlined,
  TeamOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  MessageOutlined,
  BellOutlined,
  SettingOutlined,
  BarChartOutlined,
  TrendingUpOutlined,
  LikeOutlined,
  ShareAltOutlined,
  HistoryOutlined,
  FieldTimeOutlined,
  QrcodeOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { storefrontAPI, comboAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import SimplePromoSlider from '../components/SimplePromoSlider';
import { message } from 'antd';
import './Home.css';

const { Title, Paragraph } = Typography;

const Home = ({ onCartUpdate }) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [timeBasedProducts, setTimeBasedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeBasedLoading, setTimeBasedLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('featured');
  const [selectedStore, setSelectedStore] = useState('store_1');
  const [flashSaleEndTime, setFlashSaleEndTime] = useState(null);
  const [now, setNow] = useState(new Date());
  const [currentTimeBasedTags, setCurrentTimeBasedTags] = useState([]);
  const [combos, setCombos] = useState([]);
  const [combosLoading, setCombosLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      await fetchAllData();
      await fetchCombos();
      // Đợi một chút để đảm bảo state đã được cập nhật
      setTimeout(() => {
        fetchTimeBasedRecommendations();
      }, 100);
    };
    
    loadData();
    
    // Thiết lập thời gian kết thúc Flash Sale là cuối ngày hôm nay
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    setFlashSaleEndTime(endOfDay);

    // Cập nhật thời gian hiện tại mỗi giây cho countdown
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured products
      const featuredResponse = await storefrontAPI.getProducts({ 
        limit: 8
      });
      setFeaturedProducts(featuredResponse.data.items || []);
      
      // Fetch new products (giả sử có API cho sản phẩm mới)
      const newResponse = await storefrontAPI.getProducts({ 
        limit: 6,
        sortBy: 'ngay_tao',
        sortOrder: 'desc'
      });
      setNewProducts(newResponse.data.items || []);
      
      // Fetch best sellers (giả sử có API cho sản phẩm bán chạy)
      const bestResponse = await storefrontAPI.getProducts({ 
        limit: 6,
        sortBy: 'so_luong',
        sortOrder: 'desc'
      });
      setBestSellers(bestResponse.data.items || []);
      
      setProducts(featuredResponse.data.items || []);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreetingMessage = () => {
    const tod = getTimeOfDay();
    switch (tod) {
      case 'morning':
        return 'Chúc bạn buổi sáng tốt lành!';
      case 'lunch':
        return 'Chúc bạn bữa trưa ngon miệng!';
      case 'afternoon_snack':
        return 'Buổi chiều năng động!';
      case 'dinner':
        return 'Chúc bạn bữa tối ấm áp!';
      case 'late_night':
      default:
        return 'Khuya rồi, nghỉ ngơi nhé!';
    }
  };

  const handleSearch = (raw) => {
    const inputVal = typeof raw === 'string' 
      ? raw 
      : (raw && raw.target && typeof raw.target.value === 'string' ? raw.target.value : searchQuery);
    const q = (inputVal || '').trim();
    setSearchQuery(q);
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/products');
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    navigate(`/products?category=${category}`);
  };

  const getStoreLabel = (storeId) => {
    const stores = {
      store_1: 'Chi nhánh trung tâm',
      store_2: 'Chi nhánh khu dân cư',
      store_3: 'Chi nhánh gần bạn',
    };
    return stores[storeId] || 'Chi nhánh trung tâm';
  };

  const getEtaText = (storeId) => {
    switch (storeId) {
      case 'store_1':
        return 'Giao trong ~20-30 phút';
      case 'store_2':
        return 'Giao trong ~15-25 phút';
      case 'store_3':
        return 'Giao trong ~10-20 phút';
      default:
        return 'Giao nhanh trong vòng 30 phút';
    }
  };

  const getTimeOfDay = () => {
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    
    // 5h sáng - 10h sáng: Đồ ăn sáng
    if (timeInMinutes >= 5 * 60 && timeInMinutes < 10 * 60) {
      return 'morning';
    }
    // 10h sáng - 13h30 chiều: Đồ ăn chính
    if (timeInMinutes >= 10 * 60 && timeInMinutes < 13 * 60 + 30) {
      return 'lunch';
    }
    // 13h30 - 18h (trước 6h tối): Ăn nhẹ/vặt
    if (timeInMinutes >= 13 * 60 + 30 && timeInMinutes < 18 * 60) {
      return 'afternoon_snack';
    }
    // 18h - 22h (6h tối - 10h tối): Món ăn chính
    if (timeInMinutes >= 18 * 60 && timeInMinutes < 22 * 60) {
      return 'dinner';
    }
    // Sau 22h (10h tối): Đồ ăn nhẹ/vặt
    return 'late_night';
  };

  const getTimeOfDayLabel = () => {
    const tod = getTimeOfDay();
    switch (tod) {
      case 'morning':
        return 'Đồ ăn sáng - Cà phê & Ăn nhẹ';
      case 'lunch':
        return 'Món ăn chính - Bữa trưa';
      case 'afternoon_snack':
        return 'Đồ ăn vặt xế chiều';
      case 'dinner':
        return 'Món ăn chính - Bữa tối';
      case 'late_night':
      default:
        return 'Đồ ăn nhẹ - Cứu đói khuya';
    }
  };

  const fetchTimeBasedRecommendations = async () => {
    try {
      setTimeBasedLoading(true);
      const tod = getTimeOfDay();
      const response = await storefrontAPI.getTimeBasedRecommendations({ 
        timeOfDay: tod,
        limit: 8
      });
      
      let products = response.data.items || [];
      
      // Fallback nếu không có sản phẩm từ API
      if (products.length === 0) {
        const all = [...newProducts, ...featuredProducts, ...bestSellers];
        // Filter theo category tương ứng với khung giờ
        // CHỈ bao gồm đồ ăn/đồ uống, LOẠI TRỪ: household, personalcare, groceries
        const categoryMap = {
          'morning': ['drinks', 'dairy', 'snacks'], // Đồ ăn sáng
          'lunch': ['instant', 'frozen'], // Bữa trưa
          'afternoon_snack': ['snacks', 'drinks'], // Xế chiều
          'dinner': ['instant', 'frozen'], // Bữa tối
          'late_night': ['instant', 'snacks', 'frozen'] // Khuya
        };
        const excludeCategories = ['household', 'personalcare', 'groceries'];
        const categories = categoryMap[tod] || [];
        if (categories.length > 0) {
          // Filter theo category và loại trừ các categories không phải đồ ăn/đồ uống
          products = all.filter(p => 
            categories.includes(p.danh_muc) && 
            !excludeCategories.includes(p.danh_muc)
          );
        }
        // Nếu vẫn không có, lấy bất kỳ sản phẩm đồ ăn/đồ uống
        if (products.length === 0) {
          const foodCategories = ['drinks', 'snacks', 'dairy', 'instant', 'frozen'];
          products = all.filter(p => 
            foodCategories.includes(p.danh_muc) && 
            !excludeCategories.includes(p.danh_muc)
          );
        }
        products = products.slice(0, 8);
      }
      
      setTimeBasedProducts(products);
      
      // Lưu tags hiện tại để dùng cho nút "Xem thêm"
      if (products.length > 0) {
        // Lấy tags từ sản phẩm đầu tiên nếu có
        const firstProductTags = products[0]?.tags || '';
        if (firstProductTags) {
          try {
            const parsed = JSON.parse(firstProductTags);
            setCurrentTimeBasedTags(Array.isArray(parsed) ? parsed : [parsed]);
          } catch {
            setCurrentTimeBasedTags(firstProductTags.split(',').map(t => t.trim()).filter(t => t));
          }
        } else {
          // Nếu không có tags, dùng category để filter khi click "Xem thêm"
          const categoryMap = {
            'morning': ['đồ ăn', 'đồ uống'],
            'afternoon': ['đồ ăn nhẹ', 'đồ uống'],
            'evening': ['đồ ăn chính', 'đồ ăn'],
            'late_night': ['đồ ăn nhẹ', 'đồ ăn']
          };
          setCurrentTimeBasedTags(categoryMap[tod] || []);
        }
      }
    } catch (error) {
      console.error('Fetch time-based recommendations error:', error);
      // Fallback to featured products
      const all = [...newProducts, ...featuredProducts, ...bestSellers];
      const fallback = all.slice(0, 8);
      setTimeBasedProducts(fallback);
    } finally {
      setTimeBasedLoading(false);
    }
  };

  const getTimeBasedProducts = () => {
    return timeBasedProducts.length > 0 ? timeBasedProducts : [];
  };

  const getFlashSaleProducts = () => {
    const base = bestSellers.length ? bestSellers : featuredProducts;
    return base.slice(0, 4);
  };

  const getPremiumDealProducts = () => {
    const base = featuredProducts.length ? [...featuredProducts] : [...products];
    return base
      .sort((a, b) => Number(b.gia_ban || 0) - Number(a.gia_ban || 0))
      .slice(0, 4);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Liên hệ';
    const number = Number(value);
    if (Number.isNaN(number)) return 'Liên hệ';
    return `${number.toLocaleString('vi-VN')} đ`;
  };

  const fetchCombos = async () => {
    try {
      setCombosLoading(true);
      const response = await comboAPI.getAllCombos();
      setCombos(response.data || []);
    } catch (error) {
      console.error('Fetch combos error:', error);
      setCombos([]);
    } finally {
      setCombosLoading(false);
    }
  };

  const handleAddComboToCart = async (comboId, so_luong = 1) => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        message.warning('Vui lòng đăng nhập để thêm combo vào giỏ hàng');
        navigate('/login');
        return;
      }

      await comboAPI.addComboToCart(comboId, so_luong);
      message.success('Đã thêm combo vào giỏ hàng');
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra khi thêm combo vào giỏ hàng');
    }
  };

  const calculateComboPrice = (combo) => {
    if (combo.gia_ban) {
      return Number(combo.gia_ban);
    }
    // Tính từ tổng giá các sản phẩm trong combo
    if (combo.combo_item && combo.combo_item.length > 0) {
      return combo.combo_item.reduce((total, item) => {
        const productPrice = Number(item.san_pham?.gia_ban || 0);
        const quantity = item.so_luong || 1;
        return total + (productPrice * quantity);
      }, 0);
    }
    return 0;
  };

  const utilityActions = [
    {
      key: 'repeat',
      title: 'Đặt lại đơn cũ',
      description: 'Mua lại món yêu thích chỉ với 1 chạm',
      icon: <HistoryOutlined />,
      onClick: () => navigate('/orders?repeat=true'),
    },
    {
      key: 'schedule',
      title: 'Đặt giao giờ cao điểm',
      description: 'Giữ chỗ giao trước giờ ăn tối',
      icon: <FieldTimeOutlined />,
      onClick: () => navigate('/products?schedule=true'),
    },
    {
      key: 'qr',
      title: 'Quét QR nhận hàng',
      description: 'Lấy đơn không cần xếp hàng',
      icon: <QrcodeOutlined />,
      onClick: () => navigate('/qr-pickup'),
    },
    {
      key: 'membership',
      title: 'Ví thành viên',
      description: 'Tích điểm - hoàn tiền mỗi ngày',
      icon: <CreditCardOutlined />,
      onClick: () => navigate('/membership'),
    },
  ];


  const getCountdown = () => {
    if (!flashSaleEndTime) return null;
    const diff = flashSaleEndTime - now;
    if (diff <= 0) return 'Đã kết thúc';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="home-page">
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Enhanced Hero Section - ĐẨY LÊN ĐẦU */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <CrownOutlined style={{ marginRight: 8 }} />
              Cửa hàng tiện lợi #1 Việt Nam
            </div>
            <Title level={1} className="hero-title">
              <FireOutlined style={{ color: '#93c5fd', marginRight: 12 }} />
              Mua sắm thông minh
              <br />
              <span style={{ color: '#e0f2fe' }}>Giao hàng siêu tốc</span>
            </Title>
            <Paragraph className="hero-subtitle">
              🚀 Giao hàng trong 15-30 phút • 💰 Miễn phí ship đơn từ 100k • 🛡️ 100% chính hãng
            </Paragraph>
            
            {/* Enhanced Search Bar */}
            <div className="hero-search">
              <div className="search-container">
                <Input
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  className="search-input"
                  prefix={<SearchOutlined style={{ color: '#666' }} />}
                />
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  onClick={() => handleSearch(searchQuery)}
                  className="search-button"
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>

            {false && (
              <div />
            )}

            {/* Store selector removed as requested */}

            <Space size="large" style={{ marginTop: 24 }}>
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate('/products')}
                className="hero-btn-primary"
              >
                🛒 Mua sắm ngay
              </Button>
              <Button 
                size="large" 
                icon={<ThunderboltOutlined />}
                onClick={() => navigate('/products')}
                className="hero-btn-secondary"
              >
                ⚡ Xem tất cả
              </Button>
            </Space>
          </div>
          
          <div className="hero-features">
            {/* Real-time Clock on the right */}
            <Card size="small" className="clock-card">
              <div className="clock-time">
                {now.toLocaleTimeString('vi-VN', { hour12: false })}
              </div>
              <div className="clock-date">
                {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
              <div className="clock-greeting">{getGreetingMessage()}</div>
            </Card>
            <div className="hero-stats">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" className="feature-card">
                    <ClockCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                    <div>
                      <div className="feature-title">Giao hàng nhanh</div>
                      <div className="feature-desc">15-30 phút</div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" className="feature-card">
                    <TruckOutlined style={{ color: '#1890ff', fontSize: 24 }} />
                    <div>
                      <div className="feature-title">Miễn phí ship</div>
                      <div className="feature-desc">Đơn từ 100k</div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" className="feature-card">
                    <SafetyOutlined style={{ color: '#fa8c16', fontSize: 24 }} />
                    <div>
                      <div className="feature-title">An toàn</div>
                      <div className="feature-desc">100% chính hãng</div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" className="feature-card">
                    <GiftOutlined style={{ color: '#eb2f96', fontSize: 24 }} />
                    <div>
                      <div className="feature-title">Ưu đãi</div>
                      <div className="feature-desc">Hàng ngày</div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </section>

      {/* Simple promo image slider */}
      <SimplePromoSlider onViewProducts={() => navigate('/products')} />

      {/* Quick Stats Section */}
      <section className="quick-stats-section">
        <div className="container">
          <Row gutter={[24, 24]}>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="Sản phẩm"
                  value={1250}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="Khách hàng"
                  value={15000}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="Đơn hàng/ngày"
                  value={850}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="Đánh giá"
                  value={4.8}
                  precision={1}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>
      {/* Enhanced Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <Title level={2} className="section-title">
              <StarOutlined style={{ color: '#FFB7C5', marginRight: 8 }} />
              Danh mục sản phẩm
            </Title>
            <Button 
              type="link" 
              onClick={() => navigate('/products')}
              style={{ fontSize: 16, fontWeight: 500, color: '#FFB7C5' }}
            >
              Xem tất cả →
            </Button>
          </div>
          <Paragraph style={{ color: '#8c8c8c', marginBottom: 24 }}>
            Chọn nhanh nhóm hàng bạn cần, chúng tôi luôn sẵn sàng đóng gói và giao tận cửa.
          </Paragraph>
          
          <Row gutter={[16, 16]}>
            {[
              { icon: '🥤', name: 'Đồ uống', category: 'drinks', color: '#FFB7C5' },
              { icon: '🍿', name: 'Bánh kẹo', category: 'snacks', color: '#FFC0CB' },
              { icon: '🥛', name: 'Sữa & Sản phẩm từ sữa', category: 'dairy', color: '#FFD1DC' },
              { icon: '🍜', name: 'Mì ăn liền', category: 'instant', color: '#FFE4E1' },
              { icon: '🍦', name: 'Đồ đông lạnh', category: 'frozen', color: '#FFB7C5' },
              { icon: '🧻', name: 'Đồ gia dụng', category: 'household', color: '#FFC0CB' },
              { icon: '🧴', name: 'Chăm sóc cá nhân', category: 'personalcare', color: '#FFD1DC' },
              { icon: '🛒', name: 'Tạp hóa', category: 'groceries', color: '#FFE4E1' }
            ].map((item, index) => (
              <Col xs={12} sm={8} md={6} key={index}>
                <Card 
                  hoverable 
                  className="category-card"
                  onClick={() => handleCategoryClick(item.category)}
                  style={{ 
                    border: selectedCategory === item.category ? `2px solid ${item.color}` : '2px solid transparent'
                  }}
                >
                  <div className="category-icon" style={{ fontSize: 32 }}>{item.icon}</div>
                  <div className="category-name">{item.name}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Time-Based Recommendations Section */}
      <section className="featured-products recommendations-section section-accent-reco">
        <div className="section-header">
          <div>
            <Title level={2} className="section-title">
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              {getTimeOfDayLabel()}
            </Title>
            <Paragraph style={{ color: '#8c8c8c', marginBottom: 0 }}>
              Gợi ý tự động theo thời điểm - Mua ngay không cần tìm kiếm
            </Paragraph>
          </div>
          {getTimeBasedProducts().length > 0 && (
            <Button 
              type="link" 
              onClick={() => {
                const tagsParam = currentTimeBasedTags.length > 0 
                  ? `tags=${currentTimeBasedTags.join(',')}` 
                  : '';
                const timeParam = `timeOfDay=${getTimeOfDay()}`;
                navigate(`/products?${tagsParam ? tagsParam + '&' : ''}${timeParam}`);
              }}
            >
              Xem thêm gợi ý phù hợp →
            </Button>
          )}
        </div>
        {timeBasedLoading ? (
          <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '60px 0' }} />
        ) : (
          <Row gutter={[16, 16]}>
            {getTimeBasedProducts().slice(0, 8).length > 0 ? (
              getTimeBasedProducts().slice(0, 8).map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <ProductCard product={product} onCartUpdate={onCartUpdate} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <div>Đang tải sản phẩm phù hợp...</div>
                </div>
              </Col>
            )}
          </Row>
        )}
      </section>

      {/* Flash Sale Section */}
      <section className="featured-products flash-sale-section section-accent-flash">
        <div className="section-header">
          <div>
            <Title level={2} className="section-title">
              <ThunderboltOutlined style={{ marginRight: 8 }} />
              Flash sale hôm nay
            </Title>
            <Paragraph style={{ color: '#8c8c8c', marginBottom: 0 }}>
              Số lượng giới hạn - Ưu tiên đơn thanh toán sớm
            </Paragraph>
          </div>
          {getFlashSaleProducts().length > 0 && (
            <Button 
              type="link" 
              onClick={() => navigate('/products?flash=true')}
            >
              Xem tất cả ưu đãi →
            </Button>
          )}
        </div>
        {loading ? (
          <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '60px 0' }} />
        ) : (
          <Row gutter={[16, 16]}>
            {getFlashSaleProducts().slice(0, 4).length > 0 ? (
              getFlashSaleProducts().slice(0, 4).map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <ProductCard product={product} onCartUpdate={onCartUpdate} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <div>Chưa có sản phẩm flash sale</div>
                </div>
              </Col>
            )}
          </Row>
        )}
      </section>

      <section className="featured-products premium-deal-section section-accent-premium">
        <div className="section-header">
          <Title level={2} className="section-title">
            <CrownOutlined style={{ marginRight: 8 }} />
            Deal cao cấp
          </Title>
          {getPremiumDealProducts().length > 0 && (
            <Button 
              type="link" 
              onClick={() => navigate('/products?premium=true')}
            >
              Xem tất cả ưu đãi →
            </Button>
          )}
        </div>
        {loading ? (
          <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '60px 0' }} />
        ) : (
          <Row gutter={[16, 16]}>
            {getPremiumDealProducts().length > 0 ? (
              getPremiumDealProducts().map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <ProductCard product={product} onCartUpdate={onCartUpdate} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <div>Chưa có sản phẩm deal cao cấp</div>
                </div>
              </Col>
            )}
          </Row>
        )}
      </section>


      {/* Enhanced Products Section with Tabs */}
      <section className="featured-products section-accent-featured">
        <div className="container">
          <div className="section-header">
            <Title level={2} className="section-title">
              <FireOutlined style={{ marginRight: 8 }} />
              Sản phẩm nổi bật
            </Title>
            <Button 
              type="link" 
              onClick={() => navigate('/products')}
            >
              Xem tất cả →
            </Button>
          </div>
          
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'featured',
                label: (
                  <span>
                    <StarOutlined />
                    Nổi bật
                  </span>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {featuredProducts.length > 0 ? (
                      featuredProducts.map((product, index) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={product.id || index}>
                          <ProductCard product={product} onCartUpdate={onCartUpdate} />
                        </Col>
                      ))
                    ) : (
                      <Col span={24}>
                        <div style={{ textAlign: 'center', padding: '50px 0' }}>
                          <div>Không có sản phẩm nổi bật</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                )
              },
              {
                key: 'new',
                label: (
                  <span>
                    <RocketOutlined />
                    Mới nhất
                  </span>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {newProducts.length > 0 ? (
                      newProducts.map(product => (
                        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={product.id}>
                          <ProductCard product={product} onCartUpdate={onCartUpdate} />
                        </Col>
                      ))
                    ) : (
                      <Col span={24}>
                        <div style={{ textAlign: 'center', padding: '50px 0' }}>
                          <Skeleton active paragraph={{ rows: 4 }} />
                        </div>
                      </Col>
                    )}
                  </Row>
                )
              },
              {
                key: 'bestsellers',
                label: (
                  <span>
                    <TrophyOutlined />
                    Bán chạy
                  </span>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {bestSellers.length > 0 ? (
                      bestSellers.map(product => (
                        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={product.id}>
                          <ProductCard product={product} onCartUpdate={onCartUpdate} />
                        </Col>
                      ))
                    ) : (
                      <Col span={24}>
                        <div style={{ textAlign: 'center', padding: '50px 0' }}>
                          <Skeleton active paragraph={{ rows: 4 }} />
                        </div>
                      </Col>
                    )}
                  </Row>
                )
              }
            ]}
          />
        </div>
      </section>

      {/* Utilities Section */}
      <section className="utilities-section">
        <div className="container">
          <div className="section-header">
            <div>
              <Title level={2} className="section-title">
                <RocketOutlined style={{ color: '#fa541c', marginRight: 8 }} />
                Tiện ích cửa hàng tiện lợi
              </Title>
              <Paragraph style={{ color: '#8c8c8c', marginBottom: 0 }}>
                Những tính năng thực tế giúp bạn mua sắm nhanh, không bỏ lỡ ưu đãi và tối ưu thời gian.
              </Paragraph>
            </div>
            <Button type="primary" ghost onClick={() => navigate('/services')}>
              Xem tất cả dịch vụ
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {utilityActions.map((action) => (
              <Col xs={24} sm={12} md={6} key={action.key}>
                <Card hoverable className="utility-card" onClick={action.onClick}>
                  <div className="utility-icon">{action.icon}</div>
                  <div className="utility-content">
                    <div className="utility-title">{action.title}</div>
                    <div className="utility-desc">{action.description}</div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Essentials Combos */}
      <section className="essentials-section section-accent-combo">
        <div className="container">
          <div className="section-header">
            <Title level={2} className="section-title">
              <GiftOutlined style={{ marginRight: 8 }} />
              Combo tiện lợi trong ngày
            </Title>
            <Button type="link" onClick={() => navigate('/custom-combo')}>
              Đặt combo theo nhu cầu →
            </Button>
          </div>
          {combosLoading ? (
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Col xs={24} sm={12} md={6} key={i}>
                  <Card>
                    <Skeleton active paragraph={{ rows: 3 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : combos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Paragraph>Chưa có combo nào. Vui lòng quay lại sau.</Paragraph>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {combos.slice(0, 8).map((combo) => {
                const comboPrice = calculateComboPrice(combo);
                const productNames = combo.combo_item?.map(item => item.san_pham?.ten_san_pham).filter(Boolean).join(', ') || '';
                const firstProductImage = combo.combo_item?.[0]?.san_pham?.hinh_anh;
                return (
                  <Col xs={24} sm={12} md={6} key={combo.id}>
                    <Card 
                      className="combo-card" 
                      bordered={false} 
                      hoverable
                      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}
                    >
                      <div style={{ flex: '0 0 auto', marginBottom: '12px' }}>
                        {combo.hinh_anh ? (
                          <img 
                            src={combo.hinh_anh} 
                            alt={combo.ten_combo}
                            style={{ 
                              width: '100%', 
                              height: '180px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              display: 'block'
                            }}
                          />
                        ) : firstProductImage ? (
                          <img 
                            src={firstProductImage} 
                            alt={combo.ten_combo}
                            style={{ 
                              width: '100%', 
                              height: '180px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <div style={{ 
                            width: '100%', 
                            height: '180px', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '48px'
                          }}>
                            <GiftOutlined />
                          </div>
                        )}
                      </div>
                      
                      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                        <Title level={4} style={{ marginBottom: '8px', fontSize: '16px', minHeight: '48px' }}>
                          {combo.ten_combo}
                        </Title>
                        <Paragraph 
                          style={{ 
                            minHeight: '40px', 
                            marginBottom: '12px',
                            fontSize: '13px',
                            color: '#666',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {combo.mo_ta || productNames || 'Combo tiện lợi'}
                        </Paragraph>
                        {combo.combo_item && combo.combo_item.length > 0 && (
                          <ul className="combo-perks" style={{ marginBottom: '12px', paddingLeft: '20px', fontSize: '12px', flex: '1 1 auto' }}>
                            {combo.combo_item.slice(0, 3).map((item, idx) => (
                              <li key={idx} style={{ marginBottom: '4px' }}>
                                {item.san_pham?.ten_san_pham} x{item.so_luong}
                              </li>
                            ))}
                            {combo.combo_item.length > 3 && (
                              <li style={{ color: '#52c41a', fontWeight: 'bold' }}>
                                + {combo.combo_item.length - 3} sản phẩm khác
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                      
                      <div className="combo-footer" style={{ flex: '0 0 auto', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                        <div className="combo-price" style={{ 
                          fontSize: '20px', 
                          fontWeight: 'bold', 
                          color: '#ff4d4f',
                          marginBottom: '12px',
                          textAlign: 'center'
                        }}>
                          {formatCurrency(comboPrice)}
                        </div>
                        <Button 
                          type="primary" 
                          block
                          size="large"
                          onClick={() => handleAddComboToCart(combo.id, 1)}
                          icon={<ShoppingCartOutlined />}
                          style={{ height: '40px' }}
                        >
                          Thêm vào giỏ
                        </Button>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;