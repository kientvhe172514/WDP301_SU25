import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Spin, Modal, Button, Tag, Timeline, Table, Select, Divider, message, Space } from 'antd';
import { getBookingsByDateRange } from '../../services/BookingService';
import { updateBooking } from '../../services/BookingService';
import moment from 'moment';
import { ClockCircleOutlined, UserOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;
const { Option } = Select;

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const account = useSelector((state) => state.account);
  const isAdmin = account?.permissions?.includes("Admin");
  const userHotels = account?.employee?.hotels || [];

  // Set default hotel for non-admin users
  useEffect(() => {
    if (!isAdmin && userHotels.length > 0) {
      setSelectedHotel(userHotels[0]._id);
    }
  }, [isAdmin, userHotels]);

  useEffect(() => {
    fetchBookings();
  }, [selectedHotel]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Get bookings for the next 30 days
      const startDate = moment().year(2025);
      const endDate = moment().year(2025).add(30, 'days');

      const result = await getBookingsByDateRange(
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );

      if (result.status === 'OK') {
        let filteredBookings = result.data;
        if (!isAdmin) {
          // For non-admin users, only show bookings from their assigned hotels
          const userHotelIds = userHotels.map(hotel => hotel._id);
          filteredBookings = result.data.filter(booking =>
            userHotelIds.includes(booking.rooms.hotel._id)
          );
        } else if (selectedHotel) {
          // For admin users with selected hotel
          filteredBookings = result.data.filter(booking =>
            booking.rooms.hotel._id === selectedHotel
          );
        }
        setBookings(filteredBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return '#52c41a';
      case 'Pending': return '#faad14';
      case 'Cancelled': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  // Current occupancy - rooms with active bookings
  const currentBookings = bookings.filter(booking => {
    const now = moment().year(2025);
    const checkin = moment(booking.Time.Checkin);
    const checkout = moment(booking.Time.Checkout);
    return now.isBetween(checkin, checkout) && booking.Status === 'Confirmed';
  });

  // Upcoming bookings - future check-ins
  const upcomingBookings = bookings.filter(booking => {
    const now = moment().year(2025);
    const checkin = moment(booking.Time.Checkin);
    return checkin.isAfter(now) && booking.Status !== 'Cancelled';
  }).sort((a, b) => moment(a.Time.Checkin) - moment(b.Time.Checkin));

  const currentOccupancyColumns = [
    {
      title: 'Room',
      dataIndex: ['rooms', 'RoomName'],
      width: 150,
    },
    {
      title: 'Hotel',
      dataIndex: ['rooms', 'hotel', 'NameHotel'],
      width: 200,
    },
    {
      title: 'Guest',
      dataIndex: ['customers', 'full_name'],
      width: 200,
    },
    {
      title: 'Check-in',
      dataIndex: ['Time', 'Checkin'],
      width: 150,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Check-out',
      dataIndex: ['Time', 'Checkout'],
      width: 150,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Actions',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => showBookingDetails(record)}>
          Details
        </Button>
      )
    }
  ];

  const upcomingBookingsColumns = [
    {
      title: 'Room',
      dataIndex: ['rooms', 'RoomName'],
      width: 150,
    },
    {
      title: 'Hotel',
      dataIndex: ['rooms', 'hotel', 'NameHotel'],
      width: 200,
    },
    {
      title: 'Guest',
      dataIndex: ['customers', 'full_name'],
      width: 200,
    },
    {
      title: 'Check-in',
      dataIndex: ['Time', 'Checkin'],
      width: 150,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => moment(a.Time.Checkin) - moment(b.Time.Checkin)
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: 'Actions',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => showBookingDetails(record)}>
          Details
        </Button>
      )
    }
  ];

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await updateBooking(bookingId, { Status: newStatus });
      if (response.status === "OK") {
        message.success(`Booking status updated to ${newStatus}`);
        fetchBookings(); // Refresh the bookings list
        setModalVisible(false);
      } else {
        message.error(response.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      message.error('Failed to update booking status');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>Booking Management</Title>
        </Col>
        <Col>
          {isAdmin && (
            <Select
              value={selectedHotel}
              onChange={setSelectedHotel}
              style={{ width: 200 }}
              placeholder="Select Hotel"
            >
              <Option value={null}>All Hotels</Option>
              {userHotels.map(hotel => (
                <Option key={hotel._id} value={hotel._id}>
                  {hotel.NameHotel}
                </Option>
              ))}
            </Select>
          )}
        </Col>
      </Row>

      <Card title={
        <Row align="middle">
          <UserOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
          <span>Current Occupancy</span>
        </Row>
      }>
        <Spin spinning={loading}>
          <Table
            columns={currentOccupancyColumns}
            dataSource={currentBookings}
            rowKey="_id"
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Spin>
      </Card>

      <Divider />

      <Card title={
        <Row align="middle">
          <CalendarOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
          <span>Upcoming Bookings (Next 30 Days)</span>
        </Row>
      }>
        <Spin spinning={loading}>
          <Table
            columns={upcomingBookingsColumns}
            dataSource={upcomingBookings}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        </Spin>
      </Card>

      <Modal
        title={
          <Space>
            <span>Reservation Details</span>
            {selectedBooking && (
              <Tag color={getStatusColor(selectedBooking.Status)}>
                {selectedBooking.Status}
              </Tag>
            )}
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          selectedBooking?.Status === 'Pending' && (
            <Button
              key="confirm"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(selectedBooking._id, 'Confirmed')}
            >
              Confirm Check-in
            </Button>
          ),
          selectedBooking?.Status === 'Confirmed' && (
            <Button
              key="complete"
              type="primary"
              style={{ backgroundColor: '#52c41a' }}
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(selectedBooking._id, 'Completed')}
            >
              Complete Stay
            </Button>
          ),
          (selectedBooking?.Status === 'Pending' || selectedBooking?.Status === 'Confirmed') && (
            <Button
              key="cancel"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleStatusChange(selectedBooking._id, 'Cancelled')}
            >
              Cancel Booking
            </Button>
          )
        ].filter(Boolean)}
        width={700}
      >
        {selectedBooking && (
          <div>
            <Card className="reservation-card">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>Booking Information</Title>
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <Text strong>Booking ID:</Text>
                      <br />
                      {selectedBooking._id}
                    </Col>
                    <Col span={12}>
                      <Text strong>Status:</Text>
                      <br />
                      <Tag color={getStatusColor(selectedBooking.Status)}>
                        {selectedBooking.Status}
                      </Tag>
                    </Col>
                  </Row>
                </Col>

                <Col span={24}>
                  <Divider orientation="left">Stay Details</Divider>
                  <Timeline>
                    <Timeline.Item dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}>
                      <Text strong>Check-in:</Text>
                      <br />
                      {moment(selectedBooking.Time.Checkin).format('dddd, MMMM D, YYYY HH:mm')}
                    </Timeline.Item>
                    <Timeline.Item dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}>
                      <Text strong>Check-out:</Text>
                      <br />
                      {moment(selectedBooking.Time.Checkout).format('dddd, MMMM D, YYYY HH:mm')}
                    </Timeline.Item>
                    <Timeline.Item>
                      <Text strong>Duration:</Text>
                      <br />
                      {moment(selectedBooking.Time.Checkout).diff(moment(selectedBooking.Time.Checkin), 'days')} days
                    </Timeline.Item>
                  </Timeline>
                </Col>

                <Col span={24}>
                  <Divider orientation="left">Room Information</Divider>
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <Text strong>Room:</Text>
                      <br />
                      {selectedBooking.rooms.RoomName}
                    </Col>
                    <Col span={12}>
                      <Text strong>Hotel:</Text>
                      <br />
                      {selectedBooking.rooms.hotel.NameHotel}
                    </Col>
                    <Col span={12}>
                      <Text strong>Room Price:</Text>
                      <br />
                      {selectedBooking.rooms.Price?.toLocaleString()} VND/night
                    </Col>
                    <Col span={12}>
                      <Text strong>Total Price:</Text>
                      <br />
                      {selectedBooking.SumPrice?.toLocaleString()} VND
                    </Col>
                  </Row>
                </Col>

                <Col span={24}>
                  <Divider orientation="left">Guest Information</Divider>
                  <Row gutter={[16, 8]}>
                    <Col span={24}>
                      <Text strong>Guest Name:</Text>
                      <br />
                      {selectedBooking?.customers?.full_name}
                    </Col>
                    <Col span={12}>
                      <Text strong>Phone:</Text>
                      <br />
                      {selectedBooking?.customers?.phone}
                    </Col>
                    <Col span={12}>
                      <Text strong>CCCD:</Text>
                      <br />
                      {selectedBooking?.customers?.cccd}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingPage;