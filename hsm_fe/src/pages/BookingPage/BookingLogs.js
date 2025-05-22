import React, { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Typography, Input, DatePicker, Select, Button, Tag, Space, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getBookingsByDateRange } from '../../services/BookingService';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const BookingLogs = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState([
        moment('2025-01-01'),
        moment('2025-12-31')
    ]);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchBookings();
    }, [dateRange, statusFilter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            // Ensure dates are in 2025
            if (dateRange[0].year() !== 2025 || dateRange[1].year() !== 2025) {
                setDateRange([moment('2025-01-01'), moment('2025-12-31')]);
                message.warning('Only bookings from 2025 are available');
                setLoading(false);
                return;
            }

            console.log('Fetching bookings for:', {
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD')
            });

            const result = await getBookingsByDateRange(
                dateRange[0].format('YYYY-MM-DD'),
                dateRange[1].format('YYYY-MM-DD')
            );
            if (result.status === 'OK') {
                setBookings(result.data);
            } else {
                message.error(result.message || 'Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            message.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (dates) => {
        if (!dates) {
            setDateRange([moment('2025-01-01'), moment('2025-12-31')]);
            return;
        }
        // Force both dates to be in 2025
        const startDate = moment(dates[0]).year(2025);
        const endDate = moment(dates[1]).year(2025);
        setDateRange([startDate, endDate]);
    };

    const getStatusTag = (status) => {
        const colorMap = {
            Confirmed: 'success',
            Pending: 'warning',
            Cancelled: 'error'
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
    };

    const columns = [
        {
            title: 'Room',
            dataIndex: ['rooms', 'RoomName'],
            key: 'room',
            filterable: true,
        },
        {
            title: 'Customer',
            dataIndex: ['customers', 'full_name'],
            key: 'customer',
            filterable: true,
        },
        {
            title: 'Check-in',
            dataIndex: ['Time', 'Checkin'],
            key: 'checkin',
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
            sorter: (a, b) => moment(a.Time.Checkin).unix() - moment(b.Time.Checkin).unix(),
        },
        {
            title: 'Check-out',
            dataIndex: ['Time', 'Checkout'],
            key: 'checkout',
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
            sorter: (a, b) => moment(a.Time.Checkout).unix() - moment(b.Time.Checkout).unix(),
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Price',
            dataIndex: 'SumPrice',
            key: 'price',
            render: (price) => price.toLocaleString() + ' VND',
            sorter: (a, b) => a.SumPrice - b.SumPrice,
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <div>{record.customers?.phone || "deleted customer"}</div>
                    <div>{record.customers?.cccd || "deleted customer"}</div>
                </Space>
            ),
        }
    ];

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = searchText === '' ||
            booking.rooms.RoomName.toLowerCase().includes(searchText.toLowerCase()) ||
            booking.customers.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
            booking.customers.phone.includes(searchText) ||
            booking.customers.cccd.includes(searchText);

        const matchesStatus = statusFilter === 'all' || booking.Status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                        <Title level={4}>Booking Logs (2025)</Title>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchBookings}
                            >
                                Refresh
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={8} md={6}>
                        <Input
                            placeholder="Search rooms, customers..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Select
                            style={{ width: '100%' }}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        >
                            <Option value="all">All Statuses</Option>
                            <Option value="Confirmed">Confirmed</Option>
                            <Option value="Pending">Pending</Option>
                            <Option value="Cancelled">Cancelled</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={8}>
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            style={{ width: '100%' }}
                            disabledDate={(date) => date.year() !== 2025}
                            ranges={{
                                'Full Year': [moment('2025-01-01'), moment('2025-12-31')],
                                'Q1': [moment('2025-01-01'), moment('2025-03-31')],
                                'Q2': [moment('2025-04-01'), moment('2025-06-30')],
                                'Q3': [moment('2025-07-01'), moment('2025-09-30')],
                                'Q4': [moment('2025-10-01'), moment('2025-12-31')]
                            }}
                        />
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredBookings}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} bookings`
                    }}
                />
            </Card>
        </div>
    );
};

export default BookingLogs; 