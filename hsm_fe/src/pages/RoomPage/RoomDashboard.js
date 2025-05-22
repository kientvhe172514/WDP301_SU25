import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Badge, DatePicker, Row, Col, Select, Card, Tooltip, Modal, Button, Spin, Form, Statistic } from "antd";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import * as RoomDashboardService from "../../services/RoomDashboardService";
import * as HotelService from "../../services/HotelService";
import { useSelector } from 'react-redux';
import {
    RoomDashboardContainer,
    RoomGrid,
    Rooms,
    Room,
    CalendarSection,
    DatePickerStyled,
    Legend,
    StatsCard,
    FilterSection,
} from "./RoomDashboardStyle";

const { RangePicker } = DatePicker;
const { Option } = Select;

const RoomDashboard = () => {
    const account = useSelector((state) => state.account);
    const isAdmin = account.permissions?.includes('Admin');
    const userHotel = account.employee?.hotels?.[0] || null;

    const [selectedHotel, setSelectedHotel] = useState(null);
    const [dateRange, setDateRange] = useState([
        moment().startOf('day'),
        moment().add(7, 'days').startOf('day')
    ]);
    const [roomsData, setRoomsData] = useState([]);
    const [dates, setDates] = useState([null, null]);
    const [loading, setLoading] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [filterFloor, setFilterFloor] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [showRoomTables, setShowRoomTables] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        occupied: 0,
        maintenance: 0,
        cleaning: 0
    });

    // Fetch hotels for admin
    const { data: hotels = [] } = useQuery({
        queryKey: ["hotels"],
        queryFn: HotelService.getAllHotel,
        enabled: isAdmin,
    });

    // Get unique floors and room types for filters - with null checks
    const floors = useMemo(() => {
        return roomsData && roomsData.length > 0
            ? [...new Set(roomsData.map(room => room?.Floor))].sort((a, b) => a - b)
            : [];
    }, [roomsData]);

    const roomTypes = useMemo(() => {
        return roomsData && roomsData.length > 0
            ? [...new Set(roomsData.map(room => room?.roomtype?.TypeName))]
            : [];
    }, [roomsData]);

    useEffect(() => {
        if (!isAdmin && userHotel) {
            setSelectedHotel(userHotel._id);
        }
    }, [isAdmin, userHotel]);

    const fetchRoomData = async () => {
        if (!selectedHotel || !dateRange[0] || !dateRange[1]) return;

        setLoading(true);
        try {
            const response = await RoomDashboardService.getRoomDashboardData(
                selectedHotel,
                dateRange[0].format('YYYY-MM-DD'),
                dateRange[1].format('YYYY-MM-DD')
            );

            if (response?.status === "OK" && response?.data) {
                setRoomsData(response.data.rooms || []);
                setStats(response.data.stats || {
                    total: 0,
                    available: 0,
                    occupied: 0,
                    maintenance: 0,
                    cleaning: 0
                });
                console.log("Stats received:", response.data.stats); // Debug log
            }
        } catch (error) {
            console.error("Error fetching room data:", error);
            setRoomsData([]);
            setStats({
                total: 0,
                available: 0,
                occupied: 0,
                maintenance: 0,
                cleaning: 0
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedHotel && dateRange[0] && dateRange[1]) {
            fetchRoomData();
        }
    }, [selectedHotel, dateRange[0], dateRange[1]]);

    const handleRoomClick = async (room) => {
        setSelectedRoom(room);
        try {
            const status = await RoomDashboardService.getRoomBookingStatus(
                room._id,
                dateRange[0].format('YYYY-MM-DD'),
                dateRange[1].format('YYYY-MM-DD')
            );
            setSelectedRoom(prev => ({ ...prev, bookingStatus: status.data }));
            setIsModalVisible(true);
        } catch (error) {
            console.error("Error fetching room status:", error);
        }
    };

    // Filter rooms with null checks
    const filteredRooms = useMemo(() => {
        if (!roomsData) return [];

        return roomsData.filter(room => {
            const floorMatch = filterFloor === 'all' || room?.Floor?.toString() === filterFloor;
            const typeMatch = filterType === 'all' || room?.roomtype?.TypeName === filterType;
            return floorMatch && typeMatch;
        });
    }, [roomsData, filterFloor, filterType]);

    const getStatusColor = (status) => {
        const colors = {
            'Available': '#52c41a',
            'Occupied': '#f5222d',
            'Maintenance': '#faad14',
            'Cleaning': '#1890ff'
        };
        return colors[status] || '#d9d9d9';
    };

    const disabledTime = (current) => {
        if (current && current.isSame(moment(), 'day')) {
            const currentHour = moment().hour();
            const currentMinute = moment().minute();

            return {
                disabledHours: () => Array.from({ length: currentHour }, (_, i) => i),
                disabledMinutes: (selectedHour) =>
                    selectedHour === currentHour
                        ? Array.from({ length: currentMinute }, (_, i) => i)
                        : []
            };
        }
        return {};
    };

    const handleDateChange = (value) => {
        if (value && value[0] && value[1]) {
            // Update both date states
            setDates(value);
            setDateRange([value[0], value[1]]);  // This will trigger the useEffect and fetchRoomData
        } else {
            setDates(null);
            setDateRange([null, null]);
        }
        setShowRoomTables(false);
    };

    // Add this function to handle hotel selection
    const handleHotelChange = (hotelId) => {
        setSelectedHotel(hotelId);
        // If dates are already selected, trigger the fetch
        if (dateRange[0] && dateRange[1]) {
            fetchRoomData();
        }
    };

    return (
        <RoomDashboardContainer>
            <Row gutter={[24, 24]}>
                {/* Stats Cards */}
                <Col span={24}>
                    <Row gutter={16}>
                        <Col span={4}>
                            <Card>
                                <Statistic
                                    title="Total Rooms"
                                    value={stats.total || 0}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card>
                                <Statistic
                                    title="Available"
                                    value={stats.available || 0}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card>
                                <Statistic
                                    title="Occupied"
                                    value={stats.occupied || 0}
                                    valueStyle={{ color: '#f5222d' }}
                                />
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card>
                                <Statistic
                                    title="Maintenance"
                                    value={stats.maintenance || 0}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card>
                                <Statistic
                                    title="Cleaning"
                                    value={stats.cleaning || 0}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* Filters */}
                <Col span={24}>
                    <FilterSection>
                        <Row gutter={16} align="middle">
                            {isAdmin && (
                                <Col span={6}>
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Select Hotel"
                                        onChange={handleHotelChange}
                                        value={selectedHotel}
                                    >
                                        {hotels?.data?.map(hotel => (
                                            <Option key={hotel._id} value={hotel._id}>
                                                {hotel.NameHotel}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                            )}
                            <Col span={6}>
                                <Form.Item label="Date Range">
                                    <RangePicker
                                        format="YYYY-MM-DD"
                                        value={dates}
                                        showTime={{
                                            format: 'HH:mm',
                                            minuteStep: 15,
                                            defaultValue: [
                                                moment().add(15 - (moment().minute() % 15), 'minutes'),
                                                moment().add(1, 'day').startOf('day').add(12, 'hours')
                                            ]
                                        }}
                                        onChange={handleDateChange}
                                        disabledDate={(current) => current && current < moment().startOf("day")}
                                        disabledTime={disabledTime}
                                        placeholder={['Check-in date & time', 'Check-out date & time']}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Floor"
                                    onChange={setFilterFloor}
                                    value={filterFloor}
                                >
                                    <Option value="all">All Floors</Option>
                                    {floors.map(floor => (
                                        <Option key={floor} value={floor.toString()}>
                                            Floor {floor}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={4}>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Room Type"
                                    onChange={setFilterType}
                                    value={filterType}
                                >
                                    <Option value="all">All Types</Option>
                                    {roomTypes.map(type => (
                                        <Option key={type} value={type}>
                                            {type}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                    </FilterSection>
                </Col>

                {/* Room Grid */}
                <Col span={24}>
                    <Spin spinning={loading}>
                        <RoomGrid>
                            <Rooms>
                                {filteredRooms.map((room) => (
                                    <Tooltip
                                        key={room._id}
                                        title={`${room.RoomName} - ${room.roomtype?.TypeName}
                                        Floor: ${room.Floor}
                                        Status: ${room.status}
                                        Price: ${room.Price}`}
                                    >
                                        <Room
                                            onClick={() => handleRoomClick(room)}
                                            style={{
                                                backgroundColor: getStatusColor(room.status),
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div>{room.RoomName}</div>
                                            <small>{room.status}</small>
                                        </Room>
                                    </Tooltip>
                                ))}
                            </Rooms>
                        </RoomGrid>
                    </Spin>
                </Col>
            </Row>

            <Modal
                title={`Room Details - ${selectedRoom?.RoomName}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedRoom && (
                    <div>
                        <p><strong>Room Type:</strong> {selectedRoom.roomtype?.TypeName}</p>
                        <p><strong>Floor:</strong> {selectedRoom.Floor}</p>
                        <p><strong>Status:</strong> {selectedRoom.status}</p>
                        <p><strong>Price:</strong> ${selectedRoom.Price}</p>
                        {selectedRoom.bookingStatus && (
                            <div>
                                <h3>Upcoming Bookings</h3>
                                {selectedRoom.bookingStatus.map((booking, index) => (
                                    <Card key={index} size="small" style={{ marginBottom: 8 }}>
                                        <p>Check-in: {moment(booking.checkIn).format('YYYY-MM-DD')}</p>
                                        <p>Check-out: {moment(booking.checkOut).format('YYYY-MM-DD')}</p>
                                        <p>Guest: {booking.guestName}</p>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Legend>
                <Badge color="#52c41a" text="Available" />
                <Badge color="#f5222d" text="Occupied" />
                <Badge color="#faad14" text="Maintenance" />
                <Badge color="#1890ff" text="Cleaning" />
            </Legend>
        </RoomDashboardContainer>
    );
};

export default RoomDashboard;
