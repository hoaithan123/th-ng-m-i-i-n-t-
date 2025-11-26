import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, InputNumber, Spin, message, Descriptions, Rate, List, Form, Input } from 'antd';

import { ShoppingCartOutlined, ArrowLeftOutlined, StarFilled } from '@ant-design/icons';

import { storefrontAPI, cartAPI } from '../utils/api';
import './ProductDetail.css';

const ProductDetail = ({ onCartUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsAggregate, setReviewsAggregate] = useState({ average: 0, count: 0 });
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProduct();
    fetchReviews(1);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await storefrontAPI.getProductDetail(id);
      setProduct(response.data);
    } catch (error) {
      message.error('Không tìm thấy sản phẩm');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await cartAPI.addToCart({
        id_san_pham: product.id,
        so_luong: quantity
      });
      message.success('Đã thêm sản phẩm vào giỏ hàng!');
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra!');
    } finally {
      setAdding(false);
    }
  };

  const fetchReviews = async (page = 1) => {
    try {
      setReviewsLoading(true);
      const res = await storefrontAPI.getProductReviews(id, { page, limit: 10 });
      setReviews(res.data.items || []);
      setReviewsAggregate(res.data.aggregate || { average: 0, count: 0 });
      setReviewPage(res.data.pagination?.page || 1);
    } catch (error) {
      // không chặn trang chi tiết nếu lỗi
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (values) => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      message.warning('Vui lòng đăng nhập để bình luận');
      navigate('/login');
      return;
    }
    setReviewSubmitting(true);
    try {
      const payload = { sao: values.sao, noi_dung: values.noi_dung || '' };
      const res = await storefrontAPI.addProductReview(id, payload);
      const { item, aggregate } = res.data || {};
      if (item) {
        setReviews((prev) => [item, ...prev]);
      }
      if (aggregate) setReviewsAggregate(aggregate);
      form.resetFields();
      message.success('Đã gửi bình luận');
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể gửi bình luận');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="product-detail-page">

      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24 }}
      >
        Quay lại
      </Button>

      <Card>
        <div className="product-detail-content">
          <div className="product-image-large" style={{ position: 'relative' }}>

            <img
              alt={product.ten_san_pham}
              src={product.hinh_anh || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlPhbSBwaOG7mTwvdGV4dD48L3N2Zz4='}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlPhbSBwaOG7mTwvdGV4dD48L3N2Zz4=';
              }}
            />
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #f0f0f0',
              borderRadius: 12,
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 2,
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
            }}>
              <span style={{ fontSize: 12, color: '#333', fontWeight: 700 }}>
                {Number(reviewsAggregate?.average || product.diem_trung_binh || 0).toFixed(1)}
              </span>
              <StarFilled className="star-sparkle" style={{ color: Number(reviewsAggregate?.average || product.diem_trung_binh || 0) > 0 ? '#faad14' : '#d9d9d9', fontSize: 14 }} />
            </div>

          </div>

          <div className="product-details">
            <h1>{product.ten_san_pham}</h1>
            <div className="product-code">Mã: {product.ma_san_pham}</div>
            {reviewsAggregate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#333', fontWeight: 700 }}>
                  {Number(reviewsAggregate.average || 0).toFixed(1)}
                </span>
                <StarFilled className="star-sparkle" style={{ color: Number(reviewsAggregate.average || 0) > 0 ? '#faad14' : '#d9d9d9', fontSize: 16 }} />
                <span style={{ color: '#888' }}>({reviewsAggregate.count || 0} đánh giá)</span>
              </div>
            )}
            <div className="product-price-large">{formatCurrency(product.gia_ban)}</div>

            <Descriptions column={1} style={{ marginTop: 24 }}>
              <Descriptions.Item label="Đơn vị tính">
                {product.don_vi_tinh}
              </Descriptions.Item>
              <Descriptions.Item label="Tồn kho">
                <span style={{ 
                  color: product.so_luong > 0 ? '#52c41a' : '#ff4d4f',
                  fontWeight: 'bold' 
                }}>
                  {product.so_luong > 0 ? `Còn ${product.so_luong}` : 'Hết hàng'}
                </span>
              </Descriptions.Item>
            </Descriptions>

            {product.so_luong > 0 && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <label>Số lượng:</label>
                  <InputNumber
                    min={1}
                    max={product.so_luong}
                    value={quantity}
                    onChange={setQuantity}
                    size="large"
                  />
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  loading={adding}
                  block
                >
                  Thêm vào giỏ hàng
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Reviews Section */}
      <Card style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Đánh giá & Bình luận</h3>
        <Form form={form} layout="vertical" onFinish={handleSubmitReview} style={{ marginBottom: 16 }}>
          <Form.Item name="sao" label="Đánh giá" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
            <Rate allowClear={false} className="rating-sparkle" />
          </Form.Item>
          <Form.Item name="noi_dung" label="Nội dung bình luận">
            <Input.TextArea rows={3} placeholder="Chia sẻ cảm nhận của bạn..." maxLength={500} showCount />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={reviewSubmitting}>
              Gửi bình luận
            </Button>
          </Form.Item>
        </Form>

        <List
          loading={reviewsLoading}
          locale={{ emptyText: 'Chưa có bình luận nào' }}
          dataSource={reviews}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{item.khach_hang?.ho_ten || 'Khách'}</strong>
                    <Rate allowHalf disabled value={item.sao} className="rating-sparkle" style={{ fontSize: 14 }} />
                    <span style={{ color: '#999', fontSize: 12 }}>{new Date(item.ngay_tao).toLocaleString('vi-VN')}</span>
                  </div>
                }
                description={<div style={{ whiteSpace: 'pre-wrap' }}>{item.noi_dung || ''}</div>}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default ProductDetail;