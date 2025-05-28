import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Card, Tabs, Spin, message, Typography, Switch, Row, Col, Select, Upload } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  MailOutlined,
  SaveOutlined,
  EditOutlined,
  LockOutlined,
  SettingOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CalendarOutlined,
  HomeOutlined,
  CameraOutlined,
  UploadOutlined
} from '@ant-design/icons';
import * as AccountService from '../../services/accountService';
import './profile.css';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

const ProfilePage = () => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [profileData, setProfileData] = useState({
    account: {},
    customer: null,
    employee: null,
    role: null,
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    twoFactorAuth: false,
    showOnlineStatus: true,
  });

  // Auto-clear error/success messages after 3 seconds
  useEffect(() => {
    let timer;
    if (profileError || profileSuccess || passwordError || passwordSuccess) {
      timer = setTimeout(() => {
        setProfileError('');
        setProfileSuccess('');
        setPasswordError('');
        setPasswordSuccess('');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [profileError, profileSuccess, passwordError, passwordSuccess]);

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setProfileError('Không tìm thấy token. Vui lòng đăng nhập lại.');
        message.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await AccountService.getProfile(accessToken);
      if (response.status === 'Success' && response.data) {
        const data = response.data;
        setProfileData(data);
        setAvatarPreview(data.customer?.avatar || data.employee?.image || data.account.avatar);
        profileForm.setFieldsValue({
          fullName: data.customer?.fullName || data.employee?.fullName || data.account.fullName || '',
          username: data.account.username || '',
          phone: data.customer?.phone || data.employee?.phone || '',
          cccd: data.customer?.cccd || '',
          email: data.account.email || data.employee?.email || '',
          gender: data.employee?.gender || '',
          address: data.employee?.address || '',
        });
      } else {
        const errorMsg = response.message || 'Không thể tải thông tin profile';
        setProfileError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi tải thông tin profile';
      setProfileError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [profileForm]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);


  const handleAvatarChange = ({ file }) => {
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        message.error('Chỉ hỗ trợ định dạng JPG hoặc PNG!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        message.error('Kích thước ảnh không được vượt quá 2MB!');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = async (values) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setProfileError('Không tìm thấy token. Vui lòng đăng nhập lại.');
        message.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        return;
      }

      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });
      if (avatarFile) {
        formData.append('image', avatarFile);
      }

      const response = await AccountService.updateProfile(accessToken, formData);
      if (response.status === 'Success') {
        setProfileSuccess('Cập nhật thông tin thành công!');
        message.success('Cập nhật thông tin thành công!');
        setIsEditingProfile(false);
        setAvatarFile(null);
        await fetchProfileData();
      } else {
        const errorMsg = response.message || 'Không thể cập nhật thông tin';
        setProfileError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi cập nhật thông tin';
      setProfileError(errorMsg);
      message.error(errorMsg);
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (values) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setPasswordError('Không tìm thấy token. Vui lòng đăng nhập lại.');
        message.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await AccountService.changePassword(accessToken, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (response.status === 'Success') {
        setPasswordSuccess('Đổi mật khẩu thành công!');
        message.success('Đổi mật khẩu thành công!');
        passwordForm.resetFields();
      } else {
        const errorMsg = response.message || 'Không thể đổi mật khẩu';
        setPasswordError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi đổi mật khẩu';
      setPasswordError(errorMsg);
      message.error(errorMsg);
    }
  };

  // Handle settings change
  const handleSettingsChange = (key, checked) => {
    setSettings((prev) => ({ ...prev, [key]: checked }));
    message.success(`Đã cập nhật cài đặt: ${key}`);
  };

  // Customer Profile Component
  const CustomerProfile = () => {
    console.log('Rendering CustomerProfile, isEditingProfile:', isEditingProfile);
    return (
      <Card className="customer-profile">
        <div className="header-background">
          <div className="header-overlay">
            <div className="header-content">
              <div className="avatar-container">
                <img
                  src={avatarPreview || profileData.customer?.avatar || profileData.account?.avatar || 'https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o='}
                  alt="Profile avatar"
                  className="avatar"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=Avatar';
                  }}
                />
                {isEditingProfile && (
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleAvatarChange}
                  >
                    <Button className="avatar-button" icon={<CameraOutlined />} />
                  </Upload>
                )}
              </div>
              <div className="header-info">
                <h1 className="header-title">{profileData.account?.fullName || 'Khách hàng'}</h1>
                <p className="header-subtitle">Khách hàng thân thiết</p>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-content">
          <Title level={3}>Thông tin khách hàng</Title>
          <Button
            icon={isEditingProfile ? <LockOutlined /> : <EditOutlined />}
            className="edit-button"
            onClick={() => {
              console.log('Edit button clicked, toggling isEditingProfile to:', !isEditingProfile);
              setIsEditingProfile(!isEditingProfile);
              if (!isEditingProfile) {
                profileForm.validateFields();
              }
            }}
          >
            {isEditingProfile ? 'Hủy' : 'Chỉnh sửa'}
          </Button>
          {isEditingProfile ? (
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileSubmit}
              initialValues={{
                fullName: profileData.customer?.fullName || profileData.account?.fullName || '',
                username: profileData.account?.username || '',
                phone: profileData.customer?.phone || '',
                cccd: profileData.customer?.cccd || '',
                email: profileData.account?.email || '',
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tên đăng nhập"
                    name="username"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[{ pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' }]}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="CCCD"
                    name="cccd"
                    rules={[{ pattern: /^[0-9]{12}$/, message: 'CCCD phải có 12 chữ số' }]}
                  >
                    <Input prefix={<IdcardOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Email" name="email">
                    <Input prefix={<MailOutlined />} disabled />
                  </Form.Item>
                </Col>
              </Row>
              {profileError && <p className="error-message">{profileError}</p>}
              {profileSuccess && <p className="success-message">{profileSuccess}</p>}
              <Form.Item>
                <Button type="primary" className="submit-button" htmlType="submit" icon={<SaveOutlined />}>
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <div className="info-grid">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="info-card">
                    <PhoneOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                    <div>
                      <Text strong>Số điện thoại:</Text>
                      <p>{profileData.customer?.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-card">
                    <MailOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                    <div>
                      <Text strong>Email:</Text>
                      <p>{profileData.account?.email || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="info-card">
                    <IdcardOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                    <div>
                      <Text strong>CCCD:</Text>
                      <p>{profileData.customer?.cccd || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-card">
                    <CalendarOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                    <div>
                      <Text strong>Ngày tham gia:</Text>
                      <p>
                        {profileData.account?.createdAt
                          ? new Date(profileData.account.createdAt).toLocaleDateString('vi-VN')
                          : 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Employee Profile Component
  const EmployeeProfile = () => (
    <Card className="employee-profile">
      <div className="header-background employee-header">
        <div className="header-overlay">
          <div className="header-content">
            <div className="avatar-container">
              <img
                src={avatarPreview || profileData.employee?.image || profileData.account.avatar || 'https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o='}
                alt="Profile avatar"
                className="avatar employee-avatar"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=Avatar';
                }}
              />
              {isEditingProfile && (
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleAvatarChange}
                >
                  <Button className="avatar-button" icon={<CameraOutlined />} />
                </Upload>
              )}
            </div>
            <div className="header-info">
              <h1 className="header-title employee-title">{profileData.employee?.fullName || 'Nhân viên'}</h1>
              <div className="employee-permission">
                <SettingOutlined style={{ fontSize: '16px', marginRight: '8px' }} />
                <Text>{profileData.account.permissions?.[0]?.PermissionName || 'Chưa cập nhật'}</Text>
              </div>
              <p className="header-subtitle">{profileData.employee?.gender || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="employee-content">
        {/* <Title level={3}>Thông tin nhân viên</Title> */}
        <Button
          icon={isEditingProfile ? <LockOutlined /> : <EditOutlined />}
          className="edit-button"
          onClick={() => {
            setIsEditingProfile(!isEditingProfile);
            if (!isEditingProfile) {
              profileForm.validateFields();
            }
          }}
        >
          {isEditingProfile ? 'Hủy' : 'Chỉnh sửa'}
        </Button>
        {isEditingProfile ? (
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileSubmit}
            initialValues={{
              fullName: profileData.employee?.fullName || profileData.account.fullName || '',
              username: profileData.account.username || '',
              phone: profileData.employee?.phone || '',
              email: profileData.employee?.email || profileData.account.email || '',
              gender: profileData.employee?.gender || '',
              address: profileData.employee?.address || '',
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tên đăng nhập"
                  name="username"
                  rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[{ pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' }]}
                >
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Email" name="email">
                  <Input prefix={<MailOutlined />} disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Giới tính" name="gender">
                  <Select placeholder="Chọn giới tính">
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Địa chỉ" name="address">
                  <Input prefix={<HomeOutlined />} />
                </Form.Item>
              </Col>
            </Row>
            {profileError && <p className="error-message">{profileError}</p>}
            {profileSuccess && <p className="success-message">{profileSuccess}</p>}
            <Form.Item>
              <Button type="primary" className="submit-button" htmlType="submit" icon={<SaveOutlined />}>
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="employee-grid">
            <div className="contact-section">
              <Title level={4}>Thông tin liên hệ</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="contact-card">
                    <PhoneOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
                    <div>
                      <Text className="info-label">Số điện thoại</Text>
                      <p className="info-value">{profileData.employee?.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="contact-card green">
                    <MailOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
                    <div>
                      <Text className="info-label">Email</Text>
                      <p className="info-value">{profileData.employee?.email || profileData.account.email || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="contact-card purple">
                    <HomeOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
                    <div>
                      <Text className="info-label">Địa chỉ</Text>
                      <p className="info-value">{profileData.employee?.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </Col>
              </Row>
              {profileData.employee?.hotels && profileData.employee.hotels.length > 0 && (
                <div className="contact-section">
                  <Title level={4}>Khách sạn được phân công</Title>
                  {profileData.employee.hotels.map((hotel, index) => (
                    <div key={index} className="hotel-card">
                      <HomeOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
                      <div>
                        <Text strong>{hotel.CodeHotel || 'Mã khách sạn'}:</Text>
                        <p>{hotel.NameHotel || 'Tên khách sạn'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="sidebar">
              <div className="sidebar-card">
                <Title level={4}>Thông tin khác</Title>
                <div className="info-grid">
                  <div className="info-card">
                    <CalendarOutlined style={{ fontSize: '16px', marginRight: '8px' }} />
                    <div>
                      <Text strong>Ngày tham gia:</Text>
                      <p>
                        {profileData.employee?.createdAt
                          ? new Date(profileData.employee.createdAt).toLocaleDateString('vi-VN')
                          : 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  <div className="info-card">
                    <SettingOutlined style={{ fontSize: '16px', marginRight: '8px' }} />
                    <div>
                      <Text strong>Quyền hạn:</Text>
                      <p>{profileData.account.permissions?.[0]?.PermissionName || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  // Password Tab Content
  const PasswordTab = () => (
    <Card className="password-card">
      <div className="password-header">
        <LockOutlined className="password-icon" style={{ fontSize: '24px' }} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Đổi mật khẩu</Title>
          <p>Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>
        </div>
      </div>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handlePasswordSubmit}
        className="password-form"
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        {passwordError && <p className="error-message">{passwordError}</p>}
        {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
        <Form.Item className="password-actions">
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} className="password-submit-button">
            Cập nhật mật khẩu
          </Button>
        </Form.Item>
        <div className="password-tips">
          <Text strong>Lưu ý khi tạo mật khẩu mạnh:</Text>
          <ul>
            <li>Sử dụng ít nhất 8 ký tự</li>
            <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
            <li>Không sử dụng thông tin cá nhân dễ đoán</li>
            <li>Thay đổi mật khẩu định kỳ</li>
          </ul>
        </div>
      </Form>
    </Card>
  );

  // Settings Tab Content
  const SettingsTab = () => (
    <Card className="settings-card">
      <div className="settings-header">
        <SettingOutlined className="settings-icon" style={{ fontSize: '24px' }} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Cài đặt tài khoản</Title>
          <p>Quản lý các thiết lập tài khoản của bạn</p>
        </div>
      </div>
      <div className="settings-content">
        <div className="setting-item">
          <div>
            <Text strong>Thông báo email</Text>
            <p>Nhận thông báo qua email về hoạt động tài khoản</p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onChange={(checked) => handleSettingsChange('emailNotifications', checked)}
          />
        </div>
        <div className="setting-item">
          <div>
            <Text strong>Xác thực hai bước</Text>
            <p>Tăng cường bảo mật với xác thực hai bước</p>
          </div>
          <Switch
            checked={settings.twoFactorAuth}
            onChange={(checked) => handleSettingsChange('twoFactorAuth', checked)}
          />
        </div>
        <div className="setting-item">
          <div>
            <Text strong>Hiển thị trạng thái hoạt động</Text>
            <p>Cho phép người khác thấy khi bạn đang online</p>
          </div>
          <Switch
            checked={settings.showOnlineStatus}
            onChange={(checked) => handleSettingsChange('showOnlineStatus', checked)}
          />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  const showEmployeeProfile = profileData.employee || profileData.role;

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setIsEditingProfile(false);
            profileForm.resetFields();
            passwordForm.resetFields();
            setProfileError('');
            setProfileSuccess('');
            setPasswordError('');
            setPasswordSuccess('');
            setAvatarFile(null);
            setAvatarPreview(null);
            fetchProfileData();
          }}
          className="profile-tabs"
        >
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Thông tin cá nhân
              </span>
            }
            key="profile"
          >
            {showEmployeeProfile ? <EmployeeProfile /> : <CustomerProfile />}
          </TabPane>
          <TabPane
            tab={
              <span>
                <LockOutlined />
                Đổi mật khẩu
              </span>
            }
            key="password"
          >
            <PasswordTab />
          </TabPane>
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Cài đặt
              </span>
            }
            key="settings"
          >
            <SettingsTab />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;