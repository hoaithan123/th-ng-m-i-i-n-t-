import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Empty, Tag, Spin, Button, Space } from 'antd';
import { EyeOutlined, DollarCircleOutlined, BankOutlined, MobileOutlined, CreditCardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { orderAPI } from '../utils/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cod':
        return <DollarCircleOutlined style={{ color: '#0f766e' }} />;
      case 'bank_transfer':
        return <BankOutlined style={{ color: '#2563eb' }} />;
      case 'momo':
        return <MobileOutlined style={{ color: '#7c3aed' }} />;
      case 'vnpay':
      case 'stripe':
      case 'paypal':
        return <CreditCardOutlined style={{ color: '#0f172a' }} />;
      default:
        return <DollarCircleOutlined style={{ color: '#0f172a' }} />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      'cho_xac_nhan': { color: 'gold', text: 'Chờ xác nhận' },
      'da_xac_nhan': { color: 'blue', text: 'Đã xác nhận' },
      'dang_giao': { color: 'cyan', text: 'Đang giao hàng' },
      'hoan_thanh': { color: 'green', text: 'Hoàn thành' },
      'da_huy': { color: 'red', text: 'Đã hủy' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'momo':
        return 'Ví MoMo';
      case 'stripe':
        return 'Thẻ quốc tế (Stripe)';
      default:
        return method || 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-history-page">
        <Card className="order-empty-card">
          <Empty
            description="Chưa có đơn hàng nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/products')}>
              Bắt đầu mua sắm
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="order-history-header">
        <div>
          <h1>Lịch sử đơn hàng</h1>
          <p className="order-history-subtitle">
            Theo dõi trạng thái và chi tiết các đơn hàng bạn đã đặt.
          </p>
        </div>
        <Button type="default" onClick={() => navigate('/products')}>
          Tiếp tục mua sắm
        </Button>
      </div>

      <div className="orders-list">
        {orders.map(order => (
          <Card key={order.id} className="order-card" hoverable>
            <div className="order-header">
              <div className="order-id">
                <span className="order-code">Đơn hàng #{order.ma_don_hang}</span>
                <span className="order-date">
                  {dayjs(order.ngay_tao).format('DD/MM/YYYY HH:mm')}
                </span>
              </div>
              <div className="order-status-wrap">
                {getStatusTag(order.trang_thai)}
              </div>
            </div>

            <div className="order-body">
              <div className="order-info">
                <div className="order-info-row">
                  <span className="order-label">Người nhận</span>
                  <span className="order-value">{order.ho_ten_nguoi_nhan}</span>
                </div>
                <div className="order-info-row">
                  <span className="order-label">SĐT</span>
                  <span className="order-value">{order.so_dien_thoai}</span>
                </div>
                <div className="order-info-row">
                  <span className="order-label">Địa chỉ</span>
                  <span className="order-value">{order.dia_chi_giao_hang}</span>
                </div>
              </div>

              <div className="order-meta">
                <div className="order-meta-item">
                  <span className="order-meta-label">Thanh toán</span>
                  <span className="order-meta-value payment-chip">
                    {getPaymentMethodIcon(order.phuong_thuc_thanh_toan)}
                    <span>{getPaymentMethodText(order.phuong_thuc_thanh_toan)}</span>
                  </span>
                </div>
                <div className="order-meta-item order-meta-total">
                  <span className="order-meta-label">Tổng tiền</span>
                  <span className="order-meta-amount">{formatCurrency(order.tong_tien)}</span>
                </div>
              </div>
            </div>

            <div className="order-footer">
              <Space size="small">
                <Button 
                  type="link" 
                  onClick={() => navigate(`/orders/${order.id}`)}
                  icon={<EyeOutlined />}
                >
                  Xem chi tiết
                </Button>
              </Space>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;