import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, List, Tag, Space, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { addressAPI } from '../utils/api';
import './Auth.css';

const Addresses = () => {
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [addressLabels, setAddressLabels] = useState(() => {
    try { return JSON.parse(localStorage.getItem('addressLabels') || '{}'); } catch { return {}; }
  });

  const load = async () => {
    try {
      const { data } = await addressAPI.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error('Không thể tải địa chỉ');
    }
  };

  useEffect(() => {
    load();
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      setLoadingLocation(true);
      const res = await fetch('https://provinces.open-api.vn/api/?depth=1');
      const data = await res.json();
      setProvinces(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoadingLocation(false); }
  };

  const onProvinceChange = async (code) => {
    try {
      setDistricts([]); setWards([]);
      form.setFieldsValue({ tinh_thanh: '', quan_huyen: '', phuong_xa: '' });
      const p = provinces.find(p => p.code === code);
      if (p) {
        form.setFieldsValue({ tinh_thanh: p.name });
      }
      setLoadingLocation(true);
      const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
      const data = await res.json();
      setDistricts(Array.isArray(data?.districts) ? data.districts : []);
    } catch {}
    finally { setLoadingLocation(false); }
  };

  const onDistrictChange = async (code) => {
    try {
      setWards([]);
      form.setFieldsValue({ quan_huyen: '', phuong_xa: '' });
      const d = districts.find(d => d.code === code);
      if (d) form.setFieldsValue({ quan_huyen: d.name });
      setLoadingLocation(true);
      const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
      const data = await res.json();
      setWards(Array.isArray(data?.wards) ? data.wards : []);
    } catch {}
    finally { setLoadingLocation(false); }
  };

  const onWardChange = (code) => {
    const w = wards.find(w => w.code === code);
    if (w) form.setFieldsValue({ phuong_xa: w.name });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { ten_dia_chi, ...payload } = values;
      if (editingId) {
        await addressAPI.updateAddress(editingId, payload);
        message.success('Đã cập nhật địa chỉ');
        if (ten_dia_chi !== undefined) {
          const labels = { ...addressLabels, [editingId]: ten_dia_chi };
          setAddressLabels(labels);
          localStorage.setItem('addressLabels', JSON.stringify(labels));
        }
      } else {
        const { data } = await addressAPI.createAddress(payload);
        message.success('Đã thêm địa chỉ');
        const newId = data?.address?.id;
        if (newId && ten_dia_chi) {
          const labels = { ...addressLabels, [newId]: ten_dia_chi };
          setAddressLabels(labels);
          localStorage.setItem('addressLabels', JSON.stringify(labels));
        }
      }
      form.resetFields();
      setEditingId(null);
      load();
    } catch (e) {
      const errs = e.response?.data?.errors;
      if (errs) message.error(errs.join(', '));
      else message.error(e.response?.data?.error || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr.id);
    form.setFieldsValue({
      ho_ten_nguoi_nhan: addr.ho_ten_nguoi_nhan || '',
      so_dien_thoai: addr.so_dien_thoai || '',
      dia_chi_chi_tiet: addr.dia_chi_chi_tiet || '',
      phuong_xa: addr.phuong_xa || '',
      quan_huyen: addr.quan_huyen || '',
      tinh_thanh: addr.tinh_thanh || '',
      mac_dinh: addr.mac_dinh || false,
      ten_dia_chi: addressLabels?.[addr.id] || '',
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Xóa địa chỉ này?');
    if (!ok) return;
    try {
      await addressAPI.deleteAddress(id);
      message.success('Đã xóa địa chỉ');
      if (editingId === id) {
        setEditingId(null);
        form.resetFields();
      }
      load();
    } catch (e) {
      message.error(e.response?.data?.error || 'Không thể xóa');
    }
  };

  const setDefault = async (id) => {
    try {
      await addressAPI.updateAddress(id, { mac_dinh: true });
      message.success('Đã đặt làm mặc định');
      load();
    } catch (e) {
      message.error(e.response?.data?.error || 'Không thể đặt mặc định');
    }
  };

  const formatAddress = (a) => {
    const parts = [a.dia_chi_chi_tiet, a.phuong_xa, a.quan_huyen, a.tinh_thanh].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="auth-page">
      <Card title={editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'} className="auth-card">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="ten_dia_chi" label="Tên địa chỉ (Nhà/Công ty...)" tooltip="Chỉ lưu trên trình duyệt">
            <Input size="large" placeholder="Nhà / Công ty / Khác" />
          </Form.Item>
          <Form.Item name="ho_ten_nguoi_nhan" label="Họ tên người nhận" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input size="large" placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="so_dien_thoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }, { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }]}>
            <Input size="large" placeholder="0909123456" />
          </Form.Item>
          <Form.Item name="dia_chi_chi_tiet" label="Địa chỉ chi tiết" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <Input size="large" placeholder="Số nhà, tên đường" />
          </Form.Item>
          <Form.Item label="Tỉnh/Thành">
            <Select
              showSearch
              placeholder="Chọn tỉnh/thành"
              loading={loadingLocation}
              optionFilterProp="label"
              onChange={onProvinceChange}
              options={provinces.map(p => ({ value: p.code, label: p.name }))}
            />
          </Form.Item>
          <Form.Item label="Quận/Huyện">
            <Select
              showSearch
              placeholder="Chọn quận/huyện"
              loading={loadingLocation}
              optionFilterProp="label"
              onChange={onDistrictChange}
              options={districts.map(d => ({ value: d.code, label: d.name }))}
              disabled={districts.length === 0}
            />
          </Form.Item>
          <Form.Item label="Phường/Xã">
            <Select
              showSearch
              placeholder="Chọn phường/xã"
              loading={loadingLocation}
              optionFilterProp="label"
              onChange={onWardChange}
              options={wards.map(w => ({ value: w.code, label: w.name }))}
              disabled={wards.length === 0}
            />
          </Form.Item>
          <Form.Item name="tinh_thanh" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="quan_huyen" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="phuong_xa" hidden>
            <Input />
          </Form.Item>
          <Form.Item>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                {editingId ? 'Lưu địa chỉ' : 'Thêm địa chỉ'}
              </Button>
              {editingId && (
                <Button block size="large" onClick={() => { setEditingId(null); form.resetFields(); }}>
                  Hủy chỉnh sửa
                </Button>
              )}
              <Button block size="large" onClick={() => navigate('/checkout')}>
                Trở về thanh toán
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Sổ địa chỉ" className="auth-card" style={{ marginTop: 16 }}>
        <List
          dataSource={addresses}
          locale={{ emptyText: 'Chưa có địa chỉ' }}
          renderItem={(a) => (
            <List.Item
              actions={[
                a.mac_dinh ? <Tag color="green">Mặc định</Tag> : <Button type="link" onClick={() => setDefault(a.id)}>Đặt mặc định</Button>,
                <Button type="link" onClick={() => handleEdit(a)}>Sửa</Button>,
                <Button danger type="link" onClick={() => handleDelete(a.id)}>Xóa</Button>,
              ]}
            >
              <List.Item.Meta
                title={<Space><span>{addressLabels?.[a.id] ? `[${addressLabels[a.id]}]` : null}</span><span>{a.ho_ten_nguoi_nhan}</span><span>·</span><span>{a.so_dien_thoai}</span></Space>}
                description={formatAddress(a)}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Addresses;
