import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Table, Statistic, List, Typography, Spin, Tag, Timeline, Progress, Badge } from 'antd';
import { getDashboardData } from '../../services/DashboardService';
import {
  LoadingOutlined,
  DollarOutlined,
  TeamOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const account = useSelector((state) => state.account);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!account?.employee?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await getDashboardData(account.employee.id);
        if (response.status === "OK") {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [account]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Card style={{ width: 300, textAlign: 'center' }}>
          <Spin indicator={antIcon} />
          <Title level={4}>Loading Dashboard</Title>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Card style={{ width: 300, textAlign: 'center' }}>
          <Title level={4} style={{ color: '#cf1322' }}>Data Error</Title>
          <p>Could not load dashboard data</p>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  if (account?.permissions?.includes("Admin")) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2}>Admin Dashboard</Title>

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Hotels"
                value={dashboardData.metrics.totalHotels}
                prefix={<HomeOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Monthly Revenue"
                value={dashboardData.metrics.monthlyRevenue}
                prefix={<DollarOutlined />}
                suffix="₫"
                formatter={(value) => value.toLocaleString('vi-VN')}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Employees"
                value={dashboardData.metrics.totalEmployees}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Average Occupancy"
                value={dashboardData.metrics.averageOccupancyRate}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        {/* Hotel Performance */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={12}>
            <Card title="Hotel Performance">
              <Table
                dataSource={dashboardData.statistics.hotelPerformance}
                columns={[
                  { title: 'Hotel', dataIndex: 'name', key: 'name' },
                  {
                    title: 'Occupancy Rate',
                    dataIndex: 'occupancyRate',
                    key: 'occupancyRate',
                    render: (rate) => (
                      <div>
                        <Progress percent={parseFloat(rate)} size="small" />
                      </div>
                    )
                  },
                  {
                    title: 'Revenue',
                    dataIndex: 'revenue',
                    key: 'revenue',
                    render: (value) => `${value.toLocaleString('vi-VN')} ₫`
                  }
                ]}
                pagination={false}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Staff Distribution">
              <List
                dataSource={[
                  { title: 'Hotel Managers', value: dashboardData.statistics.employeeStats.managers },
                  { title: 'Receptionists', value: dashboardData.statistics.employeeStats.receptionists },
                  { title: 'Janitors', value: dashboardData.statistics.employeeStats.janitors }
                ]}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title}
                      description={`Total: ${item.value}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Card title="Recent Transactions" style={{ marginTop: '24px' }}>
          <Table
            dataSource={dashboardData.recentActivity}
            columns={[
              {
                title: 'Transaction ID',
                dataIndex: '_id',
                key: '_id'
              },
              {
                title: 'Amount',
                dataIndex: 'FinalPrice',
                key: 'amount',
                render: (amount) => `${amount.toLocaleString('vi-VN')} ₫`
              },
              {
                title: 'Status',
                dataIndex: 'Status',
                key: 'status',
                render: (status) => (
                  <Tag color={status === 'Completed' ? 'green' : status === 'Pending' ? 'gold' : 'red'}>
                    {status}
                  </Tag>
                )
              }
            ]}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </div>
    );
  }

  // Hotel Manager or Hotel Admin Dashboard
  if (account?.permissions?.includes("Hotel-Manager") || account?.permissions?.includes("Hotel-Admin")) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2}>Hotel Dashboard</Title>

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Rooms"
                value={dashboardData.metrics.totalRooms}
                prefix={<HomeOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Occupied Rooms"
                value={dashboardData.metrics.occupiedRooms}
                suffix={`/ ${dashboardData.metrics.totalRooms}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Monthly Revenue"
                value={dashboardData.metrics.monthlyRevenue}
                prefix={<DollarOutlined />}
                suffix="₫"
                formatter={(value) => value.toLocaleString('vi-VN')}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Staff"
                value={dashboardData.metrics.totalEmployees}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Today's Activity */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={12}>
            <Card title="Today's Activity">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Check-ins"
                    value={dashboardData.statistics.todayActivity.checkIns}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Check-outs"
                    value={dashboardData.statistics.todayActivity.checkOuts}
                    prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Room Status">
              <List
                dataSource={[
                  {
                    title: 'Available',
                    value: dashboardData.statistics.roomStatus.available,
                    color: '#52c41a'
                  },
                  {
                    title: 'Needs Cleaning',
                    value: dashboardData.statistics.roomStatus.needCleaning,
                    color: '#faad14'
                  },
                  {
                    title: 'Being Cleaned',
                    value: dashboardData.statistics.roomStatus.cleaning,
                    color: '#1890ff'
                  }
                ]}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <span>
                          <Badge color={item.color} />
                          {item.title}
                        </span>
                      }
                      description={`${item.value} rooms`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Upcoming Checkouts */}
        <Card title="Upcoming Checkouts" style={{ marginTop: '24px' }}>
          <Table
            dataSource={dashboardData.statistics.upcomingCheckouts}
            columns={[
              {
                title: 'Room',
                dataIndex: ['rooms', 'RoomName'],
                key: 'room'
              },
              {
                title: 'Guest',
                dataIndex: ['customers', 'full_name'],
                key: 'guest'
              },
              {
                title: 'Checkout Time',
                dataIndex: ['Time', 'Checkout'],
                key: 'checkout',
                render: (time) => new Date(time).toLocaleString()
              }
            ]}
            pagination={false}
          />
        </Card>
      </div>
    );
  }

  // Receptionist Dashboard
  if (account?.permissions?.includes("Receptionist")) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2}>Receptionist Dashboard</Title>

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Today's Check-ins"
                value={dashboardData.metrics.todayCheckIns}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Today's Check-outs"
                value={dashboardData.metrics.todayCheckOuts}
                prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Available Rooms"
                value={dashboardData.metrics.availableRooms}
                prefix={<HomeOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Bookings"
                value={dashboardData.metrics.pendingBookings}
                prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Today's Schedule */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={12}>
            <Card title="Today's Check-ins">
              <Table
                dataSource={dashboardData.statistics.todayActivity.checkIns}
                columns={[
                  {
                    title: 'Room',
                    dataIndex: ['rooms', 'RoomName'],
                    key: 'room'
                  },
                  {
                    title: 'Guest',
                    dataIndex: ['customers', 'full_name'],
                    key: 'guest'
                  },
                  {
                    title: 'Check-in Time',
                    dataIndex: ['Time', 'Checkin'],
                    key: 'checkin',
                    render: (time) => new Date(time).toLocaleString()
                  }
                ]}
                pagination={false}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Today's Check-outs">
              <Table
                dataSource={dashboardData.statistics.todayActivity.checkOuts}
                columns={[
                  {
                    title: 'Room',
                    dataIndex: ['rooms', 'RoomName'],
                    key: 'room'
                  },
                  {
                    title: 'Guest',
                    dataIndex: ['customers', 'full_name'],
                    key: 'guest'
                  },
                  {
                    title: 'Check-out Time',
                    dataIndex: ['Time', 'Checkout'],
                    key: 'checkout',
                    render: (time) => new Date(time).toLocaleString()
                  }
                ]}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // Janitor Dashboard
  if (account?.permissions?.includes("Janitor")) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2}>Housekeeping Dashboard</Title>

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Rooms To Clean"
                value={dashboardData.metrics.totalRoomsToClean}
                prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Rooms Being Cleaned"
                value={dashboardData.metrics.roomsCleaning}
                prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Upcoming Checkouts"
                value={dashboardData.metrics.upcomingCheckouts}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Completed Today"
                value={dashboardData.metrics.completedToday}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Rooms Needing Cleaning */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={12}>
            <Card title="Rooms Needing Cleaning">
              <Table
                dataSource={dashboardData.statistics.roomsNeedingCleaning}
                columns={[
                  {
                    title: 'Room',
                    dataIndex: 'roomName',
                    key: 'room'
                  },
                  {
                    title: 'Floor',
                    dataIndex: 'floor',
                    key: 'floor'
                  },
                  {
                    title: 'Hotel',
                    dataIndex: 'hotel',
                    key: 'hotel'
                  }
                ]}
                pagination={false}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Upcoming Checkouts">
              <Timeline>
                {dashboardData?.statistics.upcomingCheckouts?.map((checkout, index) => (
                  <Timeline.Item key={index}>
                    <p>{checkout.roomName}</p>
                    <p>{new Date(checkout.checkoutTime).toLocaleString()}</p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={4}>Access Error</Title>
        <p>You don't have permission to view the dashboard.</p>
      </Card>
    </div>
  );
};

export default Dashboard;