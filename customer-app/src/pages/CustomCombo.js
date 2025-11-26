import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Input, 
  Typography, 
  Space, 
  Tag, 
  Divider, 
  message, 
  Spin,
  Empty,
  Badge,
  InputNumber
} from 'antd';
import { 
  ShoppingCartOutlined, 
  PlusOutlined, 
  MinusOutlined, 
  DeleteOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { storefrontAPI, cartAPI } from '../utils/api';
import './CustomCombo.css';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const CustomCombo = ({ onCartUpdate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [comboName, setComboName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await storefrontAPI.getProducts({ limit: 200 });
      setProducts(response.data.items || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 đ';
    const number = Number(value);
    if (Number.isNaN(number)) return '0 đ';
    return `${number.toLocaleString('vi-VN')} đ`;
  };

  const handleAddProduct = (product) => {
    if (product.so_luong <= 0) {
      message.warning('Sản phẩm đã hết hàng');
      return;
    }

    const existing = selectedProducts.find(p => p.id_san_pham === product.id);
    if (existing) {
      if (existing.so_luong >= product.so_luong) {
        message.warning(`Chỉ còn ${product.so_luong} sản phẩm trong kho`);
        return;
      }
      setSelectedProducts(selectedProducts.map(p => 
        p.id_san_pham === product.id 
          ? { ...p, so_luong: p.so_luong + 1 }
          : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, {
        id_san_pham: product.id,
        ten_san_pham: product.ten_san_pham,
        gia_ban: product.gia_ban,
        so_luong: 1,
        hinh_anh: product.hinh_anh,
        ma_san_pham: product.ma_san_pham
      }]);
    }
    message.success(`Đã thêm ${product.ten_san_pham}`, 1);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id_san_pham !== productId));
    message.success('Đã xóa sản phẩm', 1);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveProduct(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.so_luong) {
      message.warning(`Chỉ còn ${product.so_luong} sản phẩm trong kho`);
      return;
    }

    setSelectedProducts(selectedProducts.map(p => {
      if (p.id_san_pham === productId) {
        return { ...p, so_luong: newQuantity };
      }
      return p;
    }));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, p) => {
      return total + (Number(p.gia_ban) * p.so_luong);
    }, 0);
  };

  const totalItems = selectedProducts.reduce((sum, p) => sum + p.so_luong, 0);

  const handleAddToCart = async () => {
    if (selectedProducts.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    const token = localStorage.getItem('customerToken');
    if (!token) {
      message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    try {
      setSaving(true);
      const comboNameToUse = comboName.trim() || `Combo ${selectedProducts.length} món`;
      
      await cartAPI.post('/combo/add', {
        ten_combo: comboNameToUse,
        gia_ban: calculateTotal(),
        so_luong: 1,
        items: selectedProducts.map(p => ({
          id_san_pham: p.id_san_pham,
          ten_san_pham: p.ten_san_pham,
          gia_ban: p.gia_ban,
          so_luong: p.so_luong
        }))
      });

      message.success('Đã thêm combo vào giỏ hàng');
      setSelectedProducts([]);
      setComboName('');
      if (onCartUpdate) onCartUpdate();
      navigate('/cart');
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    } finally {
      setSaving(false);
    }
  };

  const handleBuyNow = async () => {
    if (selectedProducts.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    const token = localStorage.getItem('customerToken');
    if (!token) {
      message.warning('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    try {
      setSaving(true);
      const comboNameToUse = comboName.trim() || `Combo ${selectedProducts.length} món`;
      
      const response = await cartAPI.post('/combo/add', {
        ten_combo: comboNameToUse,
        gia_ban: calculateTotal(),
        so_luong: 1,
        items: selectedProducts.map(p => ({
          id_san_pham: p.id_san_pham,
          ten_san_pham: p.ten_san_pham,
          gia_ban: p.gia_ban,
          so_luong: p.so_luong
        }))
      });

      // Lưu combo ID để checkout tự động chọn
      if (response.data?.cartCombo?.id) {
        localStorage.setItem('selectedCartItems', JSON.stringify([`combo-${response.data.cartCombo.id}`]));
      }

      message.success('Đã thêm combo vào giỏ hàng');
      if (onCartUpdate) onCartUpdate();
      navigate('/checkout');
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.ten_san_pham?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ma_san_pham?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductQuantity = (productId) => {
    const selected = selectedProducts.find(p => p.id_san_pham === productId);
    return selected ? selected.so_luong : 0;
  };

  return (
    <div className="custom-combo-page">
      <div className="custom-combo-container">
        {/* Header */}
        <div className="combo-header">
          <div>
            <Title level={1} style={{ marginBottom: '8px' }}>
              <ThunderboltOutlined style={{ color: '#52c41a', marginRight: '12px' }} />
              Tạo combo theo yêu cầu
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: 0 }}>
              Chọn các sản phẩm bạn muốn và tạo combo riêng của mình với giá tốt nhất
            </Paragraph>
          </div>
        </div>

        <Row gutter={[24, 24]} style={{ marginTop: '24px' }} align="stretch">
          {/* Danh sách sản phẩm - Chiếm 2/3 màn hình */}
          <Col xs={24} lg={14} xl={14} xxl={15}>
            <Card 
              className="products-section"
              title={
                <Space>
                  <span>Sản phẩm</span>
                  <Badge count={filteredProducts.length} showZero style={{ backgroundColor: '#52c41a' }} />
                </Space>
              }
              extra={
                <Search
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                  size="large"
                />
              }
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px', color: '#666' }}>Đang tải sản phẩm...</div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <Empty description="Không tìm thấy sản phẩm" />
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(product => {
                    const quantity = getProductQuantity(product.id);
                    const isSelected = quantity > 0;
                    const isOutOfStock = product.so_luong <= 0;
                    
                    return (
                      <Card
                        key={product.id}
                        hoverable
                        className={`product-card ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                        cover={
                          product.hinh_anh ? (
                            <div className="product-image-wrapper">
                              <img 
                                alt={product.ten_san_pham} 
                                src={product.hinh_anh}
                                className="product-image"
                              />
                              {isSelected && (
                                <div className="selected-badge">
                                  <CheckCircleOutlined /> Đã chọn
                                </div>
                              )}
                              {isOutOfStock && (
                                <div className="out-of-stock-overlay">Hết hàng</div>
                              )}
                            </div>
                          ) : (
                            <div className="product-image-placeholder">
                              <span>Không có ảnh</span>
                            </div>
                          )
                        }
                      >
                        <div className="product-info">
                          <div className="product-name" title={product.ten_san_pham}>
                            {product.ten_san_pham}
                          </div>
                          <div className="product-price">{formatCurrency(product.gia_ban)}</div>
                          <div className="product-actions">
                            {isSelected ? (
                              <Space size="middle">
                                <Button 
                                  size="small" 
                                  icon={<MinusOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateQuantity(product.id, quantity - 1);
                                  }}
                                  disabled={isOutOfStock}
                                />
                                <Badge count={quantity} showZero style={{ backgroundColor: '#52c41a' }}>
                                  <span style={{ padding: '0 8px', fontWeight: 'bold' }}>{quantity}</span>
                                </Badge>
                                <Button 
                                  size="small" 
                                  icon={<PlusOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddProduct(product);
                                  }}
                                  disabled={isOutOfStock || quantity >= product.so_luong}
                                />
                              </Space>
                            ) : (
                              <Button 
                                type="primary" 
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddProduct(product);
                                }}
                                disabled={isOutOfStock}
                                block
                              >
                                {isOutOfStock ? 'Hết hàng' : 'Thêm vào combo'}
                              </Button>
                            )}
                          </div>
                          {product.so_luong !== undefined && product.so_luong > 0 && (
                            <Tag color="green" style={{ marginTop: '8px', fontSize: '11px' }}>
                              Còn {product.so_luong}
                            </Tag>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </Col>

          {/* Combo đã chọn - Chiếm 1/3 màn hình, cố định */}
          <Col xs={24} lg={10} xl={10} xxl={9}>
            <div className="combo-summary-sticky">
              <Card 
                className="combo-summary-card"
                title={
                  <Space>
                    <ShoppingCartOutlined />
                    <span>Combo của bạn</span>
                    {selectedProducts.length > 0 && (
                      <Badge count={selectedProducts.length} showZero style={{ backgroundColor: '#ff4d4f' }} />
                    )}
                  </Space>
                }
                extra={
                  selectedProducts.length > 0 && (
                    <Button 
                      type="link" 
                      danger 
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setSelectedProducts([]);
                        setComboName('');
                      }}
                    >
                      Xóa tất cả
                    </Button>
                  )
                }
              >
                {selectedProducts.length === 0 ? (
                  <Empty 
                    description="Chưa có sản phẩm nào trong combo"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: '40px 0' }}
                  />
                ) : (
                  <div className="combo-summary-content">
                    <div className="combo-name-field">
                      <label htmlFor="combo-name-input">Tên combo</label>
                      <Input
                        id="combo-name-input"
                        placeholder="Đặt tên cho combo (tùy chọn)"
                        value={comboName}
                        onChange={(e) => setComboName(e.target.value)}
                        maxLength={50}
                        allowClear
                      />
                    </div>

                    <div className="combo-highlights">
                      <div className="combo-highlight-card">
                        <span className="combo-highlight-label">Số món</span>
                        <span className="combo-highlight-value">{totalItems}</span>
                      </div>
                      <div className="combo-highlight-card accent">
                        <span className="combo-highlight-label">Tạm tính</span>
                        <span className="combo-highlight-value">{formatCurrency(calculateTotal())}</span>
                      </div>
                      <div className="combo-highlight-card">
                        <span className="combo-highlight-label">Giao hàng</span>
                        <span className="combo-highlight-value">Miễn phí</span>
                      </div>
                    </div>
                    
                    <div className="selected-products-list">
                      <div className="selected-products-grid">
                        {selectedProducts.map(product => (
                          <Card
                            key={product.id_san_pham}
                            size="small"
                            className="selected-product-item"
                            actions={[
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemoveProduct(product.id_san_pham)}
                              >
                                Xóa
                              </Button>
                            ]}
                          >
                            <div className="selected-product-content">
                              {product.hinh_anh && (
                                <img 
                                  src={product.hinh_anh} 
                                  alt={product.ten_san_pham}
                                  className="selected-product-image"
                                />
                              )}
                              <div className="selected-product-info">
                                <div className="selected-product-name" title={product.ten_san_pham}>
                                  {product.ten_san_pham}
                                </div>
                                <div className="selected-product-price">
                                  {formatCurrency(product.gia_ban)} x {product.so_luong}
                                </div>
                                <Space style={{ marginTop: '8px' }}>
                                  <Button 
                                    size="small" 
                                    icon={<MinusOutlined />}
                                    onClick={() => handleUpdateQuantity(product.id_san_pham, product.so_luong - 1)}
                                  />
                                  <InputNumber
                                    size="small"
                                    min={1}
                                    max={999}
                                    value={product.so_luong}
                                    onChange={(value) => handleUpdateQuantity(product.id_san_pham, value || 1)}
                                    style={{ width: '60px' }}
                                  />
                                  <Button 
                                    size="small" 
                                    icon={<PlusOutlined />}
                                    onClick={() => handleUpdateQuantity(product.id_san_pham, product.so_luong + 1)}
                                  />
                                </Space>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />
                    
                    <div className="combo-total">
                      <div className="total-row">
                        <span>Số sản phẩm:</span>
                        <span style={{ fontWeight: 'bold' }}>{totalItems} món</span>
                      </div>
                      <div className="total-row">
                        <span>Tạm tính:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#ff4d4f' }}>
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                      <div className="total-row">
                        <span>Phí vận chuyển:</span>
                        <span style={{ color: '#52c41a' }}>Miễn phí</span>
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div className="total-row total-final">
                        <span>Tổng cộng:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#ff4d4f' }}>
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>

                    <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }} size="middle">
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<ThunderboltOutlined />}
                        onClick={handleBuyNow}
                        loading={saving}
                        style={{ height: '48px', fontSize: '16px' }}
                      >
                        Mua ngay
                      </Button>
                      <Button
                        type="default"
                        size="large"
                        block
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        loading={saving}
                        style={{ height: '48px', fontSize: '16px' }}
                      >
                        Thêm vào giỏ hàng
                      </Button>
                    </Space>
                  </div>
                )}
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CustomCombo;
