import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Typography, Select, Statistic, Table, Spin, Space, Tag, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, LoadingOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar } from 'recharts';
import { getRevenueData } from '../../services/RevenueService';

const { Title } = Typography;

const RevenuePage = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('year');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const account = useSelector((state) => state.account);

  const isAdmin = account?.permissions?.includes("Admin");
  const isHotelManager = account?.permissions?.includes("Hotel-Manager");

  // Get user's hotels
  const userHotels = account?.employee?.hotels || [];
  const defaultHotel = userHotels[0]?._id || null;

  useEffect(() => {
    // Set default hotel for hotel managers
    if (!isAdmin && userHotels.length > 0) {
      setSelectedHotel(defaultHotel);
    }
  }, [isAdmin, userHotels, defaultHotel]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const now = new Date("2025-12-31"); // Use 2025 for testing
        let startDate, endDate;

        if (timeRange === 'month') {
          // For monthly view - use March 2025 for testing
          startDate = new Date(2025, 2, 1); // March 1st, 2025
          endDate = new Date(2025, 2, 31, 23, 59, 59); // March 31st, 2025
        } else {
          // For yearly view - use full year 2025
          startDate = new Date(2025, 0, 1);
          endDate = new Date(2025, 11, 31, 23, 59, 59);
        }

        console.log('Fetching revenue data with:', {
          employeeId: account.employee.id,
          timeRange,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          selectedHotel
        });

        const response = await getRevenueData(
          account.employee.id,
          timeRange,
          startDate.toISOString(),
          endDate.toISOString()
        );

        console.log('Revenue API response:', response);

        if (response.status === "OK") {
          setRevenueData(response.data);
        } else {
          setError(response.message || 'Failed to fetch revenue data');
          message.error(response.message || 'Failed to fetch revenue data');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message || 'Failed to fetch revenue data');
        message.error('Failed to fetch revenue data');
      } finally {
        setLoading(false);
      }
    };

    if (account?.employee?.id) {
      fetchData();
    }
  }, [timeRange, selectedHotel, account?.employee?.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Card style={{ width: 300, textAlign: 'center' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <Title level={4} style={{ marginTop: 16 }}>Loading Revenue Data</Title>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2}>Error Loading Revenue Data</Title>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Current permissions: {account?.permissions?.join(', ')}</p>
        <p>Employee hotels: {JSON.stringify(userHotels)}</p>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2}>No Revenue Data Available</Title>
        <p>No transactions found for the selected period.</p>
        <p>Current permissions: {account?.permissions?.join(', ')}</p>
        <p>Employee hotels: {JSON.stringify(userHotels)}</p>
      </div>
    );
  }

  const currentHotel = isAdmin
    ? (selectedHotel ? userHotels.find(h => h._id === selectedHotel)?.NameHotel || 'All Hotels' : 'All Hotels')
    : userHotels[0]?.NameHotel || 'Your Hotel';

  const hotelOptions = isAdmin
    ? [
      { value: null, label: 'All Hotels' },
      ...userHotels.map(hotel => ({
        value: hotel._id,
        label: hotel.NameHotel
      }))
    ]
    : [];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col>
          <Title level={2}>Revenue Analytics</Title>
          <Title level={4} style={{ marginTop: 0 }}>REVENUE FROM {currentHotel}</Title>
        </Col>
        <Col>
          <Space>
            {isAdmin && (
              <Select
                style={{ width: 200 }}
                placeholder="Select Hotel"
                onChange={setSelectedHotel}
                value={selectedHotel}
                options={hotelOptions}
              />
            )}
            <Select
              defaultValue="year"
              style={{ width: 120 }}
              onChange={setTimeRange}
              options={[
                { value: 'month', label: 'Monthly' },
                { value: 'year', label: 'Yearly' }
              ]}
            />
          </Space>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={revenueData.totalRevenue}
              precision={2}
              prefix=""
              suffix="₫"
              formatter={(value) => value.toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Booking Revenue"
              value={revenueData.bookingRevenue}
              precision={2}
              prefix=""
              suffix="₫"
              formatter={(value) => value.toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Service Revenue"
              value={revenueData.serviceRevenue}
              precision={2}
              prefix=""
              suffix="₫"
              formatter={(value) => value.toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Daily Revenue"
              value={revenueData.totalRevenue / 30}
              precision={2}
              prefix=""
              suffix="₫"
              formatter={(value) => value.toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Revenue Trend">
            <AreaChart
              width={1200}
              height={300}
              data={revenueData.revenueByDay}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="Revenue Distribution">
            <BarChart
              width={500}
              height={300}
              data={revenueData.revenueByDay}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#82ca9d" name="Bookings" />
              <Bar dataKey="services" fill="#8884d8" name="Services" />
            </BarChart>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top Performing Rooms">
            <Table
              dataSource={revenueData.topPerformingRooms}
              columns={[
                { title: 'Room Type', dataIndex: 'roomType', key: 'roomType' },
                {
                  title: 'Revenue',
                  dataIndex: 'revenue',
                  key: 'revenue',
                  render: (value) => `${value.toLocaleString('vi-VN')} ₫`
                },
                { title: 'Bookings', dataIndex: 'bookings', key: 'bookings' }
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Recent Transactions">
            <Table
              dataSource={revenueData.recentTransactions}
              columns={[
                { title: 'Date', dataIndex: 'date', key: 'date' },
                { title: 'Type', dataIndex: 'type', key: 'type' },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (amount) => `${amount.toLocaleString('vi-VN')} ₫`
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'Completed' ? 'success' : 'processing'}>
                      {status}
                    </Tag>
                  )
                }
              ]}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenuePage;