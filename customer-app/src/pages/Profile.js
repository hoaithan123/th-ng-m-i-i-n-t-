import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Card, Form, Input, Button, message, Radio, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../utils/api';
import './Auth.css';

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      const { data } = await customerAPI.getProfile();
      form.setFieldsValue({
        ho_ten: data.ho_ten || '',
        email: data.email || '',
        so_dien_thoai: data.so_dien_thoai || '',
      });
      const extras = JSON.parse(localStorage.getItem('customerProfileExtras') || '{}');
      if (extras) {
        form.setFieldsValue({
          gioi_tinh: extras.gioi_tinh || undefined,
          ghi_chu: extras.ghi_chu || '',
        });
        if (extras.ngay_sinh) {
          try {
            form.setFieldsValue({ ngay_sinh: extras.ngay_sinh ? dayjs(extras.ngay_sinh) : null });
          } catch {}
        }
      }
    } catch (e) {
      message.error('Không thể tải hồ sơ, vui lòng đăng nhập lại');
      navigate('/login');
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await customerAPI.updateProfile({
        ho_ten: values.ho_ten,
        so_dien_thoai: values.so_dien_thoai,
      });
      const updated = res.data?.customer || res.data;
      if (updated) {
        const old = JSON.parse(localStorage.getItem('customerInfo') || '{}');
        const merged = { ...old, ...updated };
        localStorage.setItem('customerInfo', JSON.stringify(merged));
      }
      const extras = {
        gioi_tinh: values.gioi_tinh,
        ngay_sinh: values.ngay_sinh ? values.ngay_sinh.format('YYYY-MM-DD') : undefined,
        ghi_chu: values.ghi_chu,
      };
      localStorage.setItem('customerProfileExtras', JSON.stringify(extras));
      message.success('Đã cập nhật thông tin');
    } catch (e) {
      message.error(e.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card title="Thông tin cá nhân" className="auth-card">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="ho_ten" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}> 
            <Input size="large" placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input size="large" disabled />
          </Form.Item>
          <Form.Item name="so_dien_thoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }, { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }]}> 
            <Input size="large" placeholder="0909123456" />
          </Form.Item>
          <Form.Item name="gioi_tinh" label="Giới tính">
            <Radio.Group>
              <Radio value="male">Nam</Radio>
              <Radio value="female">Nữ</Radio>
              <Radio value="other">Khác</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="ngay_sinh" label="Ngày sinh">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" getPopupContainer={(trigger) => trigger.parentElement} />
          </Form.Item>
          <Form.Item name="ghi_chu" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Thông tin bổ sung cho giao hàng..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
