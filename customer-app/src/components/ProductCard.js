import React, { useState } from 'react';
import { Card, Button, message, Rate } from 'antd';
import { ShoppingCartOutlined, ThunderboltOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { cartAPI, API_URL } from '../utils/api';

const ProductCard = ({ product, onCartUpdate }) => {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const baseHost = API_URL.replace(/\/api$/, '');
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${baseHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
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
        so_luong: 1
      });
      message.success('Đã thêm sản phẩm vào giỏ hàng!');
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra!');
    } finally {
      setAdding(false);
    }
  };

  const handleQuickBuy = async (e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('customerToken');
    if (!token) {
      message.warning('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    setAdding(true);
    try {
      await cartAPI.addToCart({
        id_san_pham: product.id,
        so_luong: 1
      });
      message.success('Đã thêm vào giỏ hàng! Chuyển đến trang thanh toán...');
      if (onCartUpdate) onCartUpdate();
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra!');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div 
      style={{
        border: '1px solid #f0f0f0',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#ffb7c5';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 183, 197, 0.35)';
        e.currentTarget.style.transform = 'translateY(-6px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#f0f0f0';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #f0f0f0',
        borderRadius: 12,
        padding: '2px 6px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        zIndex: 2,
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
      }}>
        <span style={{ fontSize: 12, color: '#333', fontWeight: 700 }}>
          {Number(product.diem_trung_binh || 0).toFixed(1)}
        </span>
        <StarFilled className="star-sparkle" style={{ color: Number(product.diem_trung_binh || 0) > 0 ? '#faad14' : '#d9d9d9', fontSize: 14 }} />
      </div>
      {/* Hình ảnh */}
      <div style={{
        height: '220px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 50%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px'
      }}>
        <img
          alt={product.ten_san_pham || 'Sản phẩm'}
          src={getImageUrl(product.hinh_anh) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '10px'
          }}
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
      </div>

      {/* Nội dung */}
      <div style={{
        padding: '14px 16px 16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '180px',
        rowGap: '4px'
      }}>
        {/* Tên sản phẩm */}
        <div style={{
          fontSize: '15px',
          fontWeight: '600',
          marginBottom: '6px',
          lineHeight: '1.4',
          minHeight: '40px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: '#333'
        }}>
          {product.ten_san_pham || 'Tên sản phẩm'}
        </div>
        
        {/* Giá */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#ff4d4f'
          }}>
            {formatCurrency(product.gia_ban || 0)}
          </span>
          {product.gia_goc && product.gia_goc > (product.gia_ban || 0) && (
            <span style={{
              fontSize: '12px',
              color: '#999',
              textDecoration: 'line-through'
            }}>
              {formatCurrency(product.gia_goc)}
            </span>
          )}
        </div>

        {/* Đánh giá */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8
        }}>
          <span style={{ fontSize: 14, color: '#333', fontWeight: 700 }}>
            {Number(product.diem_trung_binh || 0).toFixed(1)}
          </span>
          <StarFilled className="star-sparkle" style={{ color: Number(product.diem_trung_binh || 0) > 0 ? '#faad14' : '#d9d9d9', fontSize: 14 }} />
          <span style={{ fontSize: 12, color: '#888' }}>
            {(product.so_luot_danh_gia || product.rating_count) ? `${product.so_luot_danh_gia || product.rating_count} đánh giá` : 'Chưa có đánh giá'}
          </span>
          {product.so_luot_binh_luan || product.comment_count ? (
            <span style={{ fontSize: 12, color: '#b0b0b0' }}>
              · {(product.so_luot_binh_luan || product.comment_count)} bình luận
            </span>
          ) : null}
        </div>
        
        {/* Số lượng */}
        <div style={{
          fontSize: '13px',
          color: '#888',
          marginBottom: '14px'
        }}>
          Còn: {product.so_luong || 0} {product.don_vi_tinh || 'cái'}
        </div>
        
        {/* Nút thêm vào giỏ */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          marginTop: 'auto'
        }}>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            loading={adding}
            style={{
              height: '34px',
              fontSize: '13px',
              fontWeight: '600',
              flex: 3,
              borderRadius: '999px',
              boxShadow: '0 4px 10px rgba(24, 144, 255, 0.25)'
            }}
          >
            Thêm vào giỏ
          </Button>
          
          <Button
            type="default"
            icon={<ThunderboltOutlined />}
            onClick={handleQuickBuy}
            loading={adding}
            style={{
              height: '34px',
              fontSize: '13px',
              fontWeight: '600',
              flex: 2,
              borderRadius: '999px',
              backgroundColor: '#fff0f5',
              borderColor: '#ff9aa2',
              color: '#ff4d6a'
            }}
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;