import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Radio,
  DatePicker,
  Tabs,
  Avatar,
  Tag,
  Row,
  Col,
  Statistic,
  Progress,
  Divider,
  Space,
  Switch,
  List
} from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CrownOutlined, LockOutlined, BellOutlined } from '@ant-design/icons';
import { customerAPI } from '../utils/api';
import './Account.css';

const Account = () => {
  const navigate = useNavigate();
  const [profileForm] = Form.useForm();
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [extras, setExtras] = useState({});
  const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');
  const popupContainer = useCallback(() => document.body, []);

  const loadProfile = async () => {
    try {
      const { data } = await customerAPI.getProfile();
      const storedExtras = JSON.parse(localStorage.getItem('customerProfileExtras') || '{}');
      setExtras(storedExtras);

      profileForm.setFieldsValue({
        ho_ten: data.ho_ten || '',
        email: data.email || '',
        so_dien_thoai: data.so_dien_thoai || '',
        gioi_tinh: storedExtras.gioi_tinh || undefined,
        ghi_chu: storedExtras.ghi_chu || '',
        nghe_nghiep: storedExtras.nghe_nghiep || '',
        so_thich: storedExtras.so_thich || '',
        thong_bao: storedExtras.thong_bao !== undefined ? storedExtras.thong_bao : true,
        ngay_sinh: storedExtras.ngay_sinh ? dayjs(storedExtras.ngay_sinh) : null,
      });
    } catch (e) {
      message.error('Không thể tải hồ sơ, vui lòng đăng nhập lại');
      navigate('/login');
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async (values) => {
    setSavingProfile(true);
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
      const newExtras = {
        gioi_tinh: values.gioi_tinh,
        ngay_sinh: values.ngay_sinh ? values.ngay_sinh.format('YYYY-MM-DD') : undefined,
        ghi_chu: values.ghi_chu,
        nghe_nghiep: values.nghe_nghiep,
        so_thich: values.so_thich,
        thong_bao: values.thong_bao,
      };
      localStorage.setItem('customerProfileExtras', JSON.stringify(newExtras));
      setExtras(newExtras);
      message.success('Đã cập nhật thông tin');
    } catch (e) {
      message.error(e.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const membershipLevel = extras?.membershipLevel || 'Member';
  const membershipProgress = extras?.membershipProgress || 45;

  const profileTab = (
    <Form form={profileForm} layout="vertical" onFinish={saveProfile} className="account-form">
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="ho_ten" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="so_dien_thoai" label="Số điện thoại" rules={[
            { required: true, message: 'Vui lòng nhập SĐT' },
            { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }
          ]}>
            <Input placeholder="0909123456" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="gioi_tinh" label="Giới tính">
            <Radio.Group>
              <Radio value="male">Nam</Radio>
              <Radio value="female">Nữ</Radio>
              <Radio value="other">Khác</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
        <Form.Item name="ngay_sinh" label="Ngày sinh">
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            getPopupContainer={popupContainer}
          />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="nghe_nghiep" label="Nghề nghiệp">
            <Input placeholder="VD: Nhân viên văn phòng" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="so_thich" label="Sở thích">
        <Input placeholder="Cà phê, đọc sách..." />
      </Form.Item>

      <Form.Item name="ghi_chu" label="Ghi chú">
        <Input.TextArea rows={3} placeholder="Thông tin bổ sung cho giao hàng..." />
      </Form.Item>

      <Form.Item
        name="thong_bao"
        label="Nhận thông báo khuyến mãi"
        valuePropName="checked"
      >
        <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={savingProfile} block size="large">
          Lưu thay đổi
        </Button>
      </Form.Item>
    </Form>
  );

  const securityTab = (
    <div className="account-security">
      <Card bordered={false} className="security-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="security-row">
            <div>
              <h4>Đăng nhập & mật khẩu</h4>
              <p>Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
            </div>
            <Button type="primary" icon={<LockOutlined />}>Đổi mật khẩu</Button>
          </div>
          <Divider />
          <div className="security-row">
            <div>
              <h4>Thiết bị đã đăng nhập</h4>
              <p>Quản lý các thiết bị đã đăng nhập vào tài khoản.</p>
            </div>
            <Button>Quản lý</Button>
          </div>
          <Divider />
          <List
            header="Hoạt động gần đây"
            dataSource={[
              { title: 'Đăng nhập trên Chrome - TP.HCM', time: 'Hôm nay, 09:12' },
              { title: 'Đặt hàng thành công', time: 'Hôm qua, 20:45' },
              { title: 'Cập nhật thông tin tài khoản', time: '02 ngày trước' },
            ]}
            renderItem={item => (
              <List.Item>
                <div>
                  <strong>{item.title}</strong>
                  <div className="activity-time">{item.time}</div>
                </div>
              </List.Item>
            )}
          />
        </Space>
      </Card>
    </div>
  );

  const preferenceTab = (
    <div className="account-preferences">
      <Card bordered={false}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="preference-item">
            <div>
              <h4>Thông báo đơn hàng</h4>
              <p>Nhận cập nhật khi đơn hàng thay đổi trạng thái.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Divider />
          <div className="preference-item">
            <div>
              <h4>Ưu đãi & khuyến mãi</h4>
              <p>Thông báo về flash sale, mã giảm giá và combo mới.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Divider />
          <div className="preference-item">
            <div>
              <h4>Thông báo qua email</h4>
              <p>Nhận thông tin mua sắm qua email đăng ký.</p>
            </div>
            <Switch defaultChecked={extras?.thong_bao !== false} />
          </div>
        </Space>
      </Card>
    </div>
  );

  const tabItems = [
    { key: 'profile', label: 'Thông tin cá nhân', children: profileTab },
    { key: 'security', label: 'Bảo mật & đăng nhập', children: securityTab },
    { key: 'preferences', label: 'Tùy chỉnh & thông báo', children: preferenceTab },
  ];

  return (
    <div className="account-page">
      <div className="account-grid">
        <div className="account-summary">
          <Card className="summary-card">
            <div className="summary-header">
              <Avatar size={72} icon={<UserOutlined />} />
              <div>
                <h2>{customerInfo.ho_ten || 'Khách hàng'}</h2>
                <Tag color="gold" icon={<CrownOutlined />}>{membershipLevel}</Tag>
              </div>
            </div>
            <div className="summary-contact">
              <p><MailOutlined /> {customerInfo.email || 'Chưa cập nhật'}</p>
              <p><PhoneOutlined /> {customerInfo.so_dien_thoai || 'Chưa cập nhật'}</p>
            </div>
            <div className="summary-stats">
              <Statistic title="Đơn hàng" value={extras?.ordersCount || 12} />
              <Statistic title="Đơn đã nhận" value={extras?.completedOrders || 10} />
              <Statistic title="Combo đã mua" value={extras?.comboCount || 6} />
            </div>
            <Divider />
            <div className="membership-progress">
              <div className="membership-info">
                <span>Hoàn thành để lên hạng tiếp</span>
                <span>{membershipProgress}%</span>
              </div>
              <Progress percent={membershipProgress} showInfo={false} strokeColor="#722ed1" />
            </div>
          </Card>
        </div>

        <div className="account-content">
          <Card className="content-card">
            <Tabs
              items={tabItems}
              activeKey={activeTab}
              onChange={setActiveTab}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;
