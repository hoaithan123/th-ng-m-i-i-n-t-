import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotForm] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/employee/login', values);

      const { token, nhanVien } = res.data;

      if (!token) throw new Error('Token không tồn tại trong phản hồi');

      // Lưu token, role và thông tin người dùng
      localStorage.setItem('token', token);
      localStorage.setItem('role', nhanVien?.vai_tro || '');
      localStorage.setItem('userName', nhanVien?.ho_ten || 'Admin');

      message.success('Đăng nhập thành công');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      message.error(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (values) => {
    setForgotLoading(true);
    try {
      await api.post('/auth/employee/forgot-password', {
        tai_khoan: values.tai_khoan,
        mat_khau_moi: values.mat_khau_moi,
      });

      message.success('Đặt lại mật khẩu thành công, hãy đăng nhập bằng mật khẩu mới');
      setForgotVisible(false);
      forgotForm.resetFields();
    } catch (err) {
      console.error('Forgot password error:', err);
      message.error(err.response?.data?.error || 'Không thể đặt lại mật khẩu');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', backgroundColor: '#f0f2f5'
    }}>
      <Card title="Đăng nhập hệ thống" style={{ width: 400 }}>
        <Form name="login" onFinish={onFinish}>
          <Form.Item name="tai_khoan" rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}>
            <Input placeholder="Tài khoản" />
          </Form.Item>
          <Form.Item name="mat_khau" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập
            </Button>
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Button type="link" onClick={() => setForgotVisible(true)}>
                Quên mật khẩu?
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Quên mật khẩu"
        open={forgotVisible}
        onCancel={() => setForgotVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={forgotForm}
          layout="vertical"
          onFinish={handleForgotSubmit}
        >
          <Form.Item
            name="tai_khoan"
            label="Tài khoản"
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
          >
            <Input placeholder="Nhập tài khoản nhân viên" />
          </Form.Item>
          <Form.Item
            name="mat_khau_moi"
            label="Mật khẩu mới"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={forgotLoading}
              block
            >
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
