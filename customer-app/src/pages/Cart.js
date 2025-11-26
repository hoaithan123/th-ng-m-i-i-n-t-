import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, InputNumber, Empty, message, Spin, Checkbox, Divider, Modal, Collapse, Tag } from 'antd';
import { DeleteOutlined, ShoppingOutlined, GiftOutlined, DownOutlined } from '@ant-design/icons';
import { cartAPI } from '../utils/api';
import './Cart.css';

const { Panel } = Collapse;

const Cart = ({ onCartUpdate }) => {
  const [cartData, setCartData] = useState({ products: [], combos: [] });
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]); // [{type: 'product'|'combo', id: number}]
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      const data = response.data || {};
      setCartData({
        products: Array.isArray(data.products) ? data.products : [],
        combos: Array.isArray(data.combos) ? data.combos : []
      });
    } catch (error) {
      console.error('Cart fetch error:', error);
      message.error('Lỗi khi tải giỏ hàng');
      setCartData({ products: [], combos: [] });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleUpdateQuantity = async (itemId, newQuantity, type = 'product') => {
    if (newQuantity < 1) return;

    try {
      if (type === 'combo') {
        await cartAPI.put(`/combo/${itemId}`, { so_luong: newQuantity });
      } else {
        await cartAPI.updateCartItem(itemId, { so_luong: newQuantity });
      }
      fetchCart();
      if (onCartUpdate) onCartUpdate();
      message.success('Đã cập nhật số lượng');
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra!');
      fetchCart();
    }
  };

  const handleRemoveItem = async (itemId, type = 'product') => {
    try {
      if (type === 'combo') {
        await cartAPI.delete(`/combo/${itemId}`);
      } else {
        await cartAPI.removeFromCart(itemId);
      }
      fetchCart();
      if (onCartUpdate) onCartUpdate();
      message.success('Đã xóa khỏi giỏ hàng');
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra!');
    }
  };

  const [confirmingItem, setConfirmingItem] = useState(null);

  // Merge và sắp xếp theo ngày thêm (mới nhất lên trên)
  const allItems = [
    ...(Array.isArray(cartData.products) ? cartData.products.map(p => ({ ...p, type: 'product', uniqueId: `product-${p.id}`, sortDate: p.ngay_them })) : []),
    ...(Array.isArray(cartData.combos) ? cartData.combos.map(c => ({ ...c, type: 'combo', uniqueId: `combo-${c.id}`, sortDate: c.ngay_them })) : [])
  ].sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

  const calculateTotal = () => {
    return allItems.reduce((total, item) => {
      if (item.type === 'combo') {
        return total + (Number(item.gia_ban) * item.so_luong);
      } else {
        return total + (Number(item.san_pham.gia_ban) * item.so_luong);
      }
    }, 0);
  };

  const calculateSelectedTotal = () => {
    return selectedItems.reduce((total, selected) => {
      const item = allItems.find(i => i.uniqueId === selected);
      if (item) {
        if (item.type === 'combo') {
          return total + (Number(item.gia_ban) * item.so_luong);
        } else {
          return total + (Number(item.san_pham.gia_ban) * item.so_luong);
        }
      }
      return total;
    }, 0);
  };

  const handleSelectItem = (uniqueId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, uniqueId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== uniqueId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(allItems.map(item => item.uniqueId));
    } else {
      setSelectedItems([]);
    }
  };

  const isAllSelected = selectedItems.length === allItems.length && allItems.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < allItems.length;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm để đặt hàng');
      return;
    }
    
    localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="cart-page">
        <Card>
          <Empty
            description="Giỏ hàng trống"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/products')}>
              Tiếp tục mua sắm
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Giỏ hàng của bạn</h1>

      <div className="cart-content">
        <div className="cart-items">
          <Card className="cart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Chọn tất cả ({allItems.length} {allItems.length === 1 ? 'sản phẩm' : 'sản phẩm'})
              </Checkbox>
              <span style={{ color: '#666', fontSize: '14px' }}>
                Đã chọn: {selectedItems.length} {selectedItems.length === 1 ? 'sản phẩm' : 'sản phẩm'}
              </span>
            </div>
          </Card>

          {/* Products */}
          {cartData.products && cartData.products.length > 0 && cartData.products.map(item => (
            <Card key={item.id} className="cart-item">
              <div className="cart-item-content">
                <Checkbox
                  checked={selectedItems.includes(`product-${item.id}`)}
                  onChange={(e) => handleSelectItem(`product-${item.id}`, e.target.checked)}
                />
                
                <img
                  src={item.san_pham?.hinh_anh || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNQPC90ZXh0Pjwvc3ZnPg=="}
                  alt={item.san_pham.ten_san_pham}
                  className="cart-item-image"
                />
                
                <div className="cart-item-info">
                  <h3>{item.san_pham.ten_san_pham}</h3>
                  <p className="cart-item-code">Mã: {item.san_pham.ma_san_pham}</p>
                  <p className="cart-item-price">
                    {formatCurrency(item.san_pham.gia_ban)}
                  </p>
                </div>

                <div className="cart-item-actions">
                  <InputNumber
                    min={1}
                    max={item.san_pham.so_luong}
                    value={item.so_luong}
                    onChange={(value) => handleUpdateQuantity(item.id, value, 'product')}
                  />
                  
                  <div className="cart-item-subtotal">
                    {formatCurrency(Number(item.san_pham.gia_ban) * item.so_luong)}
                  </div>

                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setConfirmingItem({ id: item.id, type: 'product' })} />
                </div>
              </div>
            </Card>
          ))}

          {/* Combos */}
          {cartData.combos && cartData.combos.length > 0 && cartData.combos.map(combo => (
            <Card key={combo.id} className="cart-item cart-item-combo">
              <div className="cart-item-content">
                <Checkbox
                  checked={selectedItems.includes(`combo-${combo.id}`)}
                  onChange={(e) => handleSelectItem(`combo-${combo.id}`, e.target.checked)}
                />
                
                <div className="cart-item-image combo-icon">
                  <GiftOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                </div>
                
                <div className="cart-item-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Tag color="green" icon={<GiftOutlined />}>COMBO</Tag>
                    <h3 style={{ margin: 0 }}>{combo.ten_combo}</h3>
                  </div>
                  
                  <Collapse
                    ghost
                    expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                    style={{ marginTop: '8px' }}
                  >
                    <Panel header={`Xem ${combo.combo_items?.length || 0} sản phẩm trong combo`} key="1">
                      <div style={{ padding: '8px 0' }}>
                        {Array.isArray(combo.combo_items) && combo.combo_items.length > 0 ? (
                          combo.combo_items.map((item, idx) => (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              padding: '4px 0',
                              borderBottom: idx < combo.combo_items.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}>
                              <span style={{ fontSize: '13px', color: '#666' }}>
                                {item.ten_san_pham} x{item.so_luong}
                              </span>
                              <span style={{ fontSize: '13px', color: '#666' }}>
                                {formatCurrency(Number(item.don_gia) * item.so_luong)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '8px 0', color: '#999', fontSize: '13px' }}>
                            Không có sản phẩm trong combo
                          </div>
                        )}
                      </div>
                    </Panel>
                  </Collapse>
                  
                  <p className="cart-item-price" style={{ marginTop: '12px', fontSize: '18px' }}>
                    {formatCurrency(combo.gia_ban)}
                  </p>
                </div>

                <div className="cart-item-actions">
                  <InputNumber
                    min={1}
                    value={combo.so_luong}
                    onChange={(value) => handleUpdateQuantity(combo.id, value, 'combo')}
                  />
                  
                  <div className="cart-item-subtotal">
                    {formatCurrency(Number(combo.gia_ban) * combo.so_luong)}
                  </div>

                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setConfirmingItem({ id: combo.id, type: 'combo' })} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="cart-summary">
          <Card title="Tổng đơn hàng">
            <div className="summary-row">
              <span>Tạm tính ({selectedItems.length} {selectedItems.length === 1 ? 'sản phẩm' : 'sản phẩm'}):</span>
              <span className="summary-amount">{formatCurrency(calculateSelectedTotal())}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span className="summary-amount">Miễn phí</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span className="summary-total">{formatCurrency(calculateSelectedTotal())}</span>
            </div>
            <Button 
              type="primary" 
              size="large" 
              block
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
            >
              Tiến hành đặt hàng ({selectedItems.length} {selectedItems.length === 1 ? 'sản phẩm' : 'sản phẩm'})
            </Button>
            <Button 
              size="large" 
              block
              style={{ marginTop: 8 }}
              onClick={() => navigate('/products')}
            >
              <ShoppingOutlined /> Tiếp tục mua sắm
            </Button>
          </Card>
        </div>
      </div>
    
      <Modal
        title="Xóa sản phẩm này?"
        open={confirmingItem !== null}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        maskClosable={false}
        destroyOnClose={false}
        getContainer={false}
        onOk={async () => {
          const item = confirmingItem;
          setConfirmingItem(null);
          if (item) {
            await handleRemoveItem(item.id, item.type);
          }
        }}
        onCancel={() => setConfirmingItem(null)}
      />
    </div>
  );
};

export default Cart;
