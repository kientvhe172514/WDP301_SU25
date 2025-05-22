import React, { useState, useEffect } from "react";
import { Input, Button, Form, notification, Card, Row, Col, Table, Alert, DatePicker, InputNumber, Select } from "antd";
import { checkCustomerExists } from "../../services/CustomerService";
import { getAvailableRooms, checkRoomAvailability } from "../../services/RoomService";
import moment from "moment";
import { getAllServices } from "../../services/ServiceService";
import { createTransaction } from "../../services/TransactionService";
import { createPaymentLink } from "../../services/VNPayService";
import { CopyrightCircleTwoTone } from '@ant-design/icons';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Statistic from "antd/es/statistic/Statistic";
import { getAllHotel } from "../../services/HotelService";
import TestNotification from "../HouseKeepingPage/TestNotification";
import { io } from "socket.io-client";
const socket = io("http://localhost:9999");
const { RangePicker } = DatePicker;

const ReservationPage = () => {
    const [paymentLink, setPaymentLink] = useState('');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [customerExists, setCustomerExists] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [warningVisible, setWarningVisible] = useState(false);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [autoFill, setAutoFill] = useState(false);
    const [dates, setDates] = useState([null, null]); // For check-in and check-out dates
    const [paymentType, setPaymentType] = useState(""); // For Partial Pay / Full Pay
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [showRoomTables, setShowRoomTables] = useState(false);
    const totalRoomPrice = selectedRooms.reduce((total, room) => total + room.totalPrice, 0);
    const totalServicePrice = selectedServices.reduce((total, service) => total + service.totalPrice, 0);
    const finalPrice = totalRoomPrice + totalServicePrice;
    const account = useSelector((state) => state.account);
    const navigate = useNavigate();
    // Initialize notification hook
    const [api, contextHolder] = notification.useNotification();
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const isAdmin = account?.permissions?.includes("Admin");
    const userHotels = account?.employee?.hotels || [];

    useEffect(() => {
        const initializePage = async () => {
            await fetchAvailableRooms();
            await fetchServices();

            if (isAdmin) {
                console.log("User is admin, fetching all hotels");
                await fetchAllHotels();
            } else if (userHotels.length > 0) {
                console.log("Setting default hotel for non-admin user:", userHotels[0]);
                setSelectedHotel(userHotels[0]._id);
            }
        };

        initializePage();
    }, [isAdmin, userHotels]);

    const fetchAvailableRooms = async () => {
        try {
            const rooms = await getAvailableRooms();
            if (rooms.status === "OK") {
                setAvailableRooms(rooms.data);
            } else {
                console.error("Failed to fetch rooms:", rooms.message);
            }
        } catch (e) {
            console.error("Error fetching available rooms:", e);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await getAllServices();
            if (res.status === "OK") {
                setServices(res.data);
            } else {
                console.error("Failed to fetch services:", res.message);
            }
        } catch (e) {
            console.error("Error fetching services:", e);
        }
    };

    const fetchAllHotels = async () => {
        try {
            console.log("Fetching all hotels...");
            const response = await getAllHotel();
            console.log("Hotels response:", response);

            if (response.status === "OK") {
                setHotels(response.data);
                if (response.data.length > 0) {
                    setSelectedHotel(response.data[0]._id);
                }
            } else {
                console.error("Failed to fetch hotels:", response.message);
            }
        } catch (error) {
            console.error("Error fetching hotels:", error);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        const { phone, cccd } = values;

        const result = await checkCustomerExists(phone, cccd);
        if (result.status === "ERR") {
            setCustomerExists(result.data);
            setWarningVisible(true);
        } else {
            // Show success notification
            api.success({
                message: "Customer Available",
                description: "You can proceed with the reservation.",
            });
            form.resetFields();
        }
        setLoading(false);
    };

    const handlePaymentChange = (value) => {
        setPaymentMethod(value);
        setPaymentType(""); // Reset payment type when changing payment method
    };

    const handlePaymentTypeChange = (value) => {
        setPaymentType(value);
    };

    const handleFieldChange = async (changedValue) => {
        const { phone, cccd } = changedValue;
        if (phone || cccd) {
            setLoading(true);
            const result = await checkCustomerExists(phone, cccd);
            if (result.status === "ERR") {
                setCustomerExists(result.data);
                setWarningVisible(true);
            } else {
                setCustomerExists(null);
                setWarningVisible(false);
            }
            setLoading(false);
        }
    };

    const handleAutoFill = () => {
        form.setFieldsValue({
            full_name: customerExists.full_name,
            phone: customerExists.phone,
            cccd: customerExists.cccd,
        });
        setAutoFill(true);
        setWarningVisible(false);
    };

    const handleCancelAutoFill = () => {
        setWarningVisible(false);
        setAutoFill(false);
    };

    const handleBookRoom = (room) => {
        if (!dates[0] || !dates[1]) {
            api.error({
                message: "Select Dates First",
                description: "Please select the check-in and check-out dates before booking a room.",
            });
            return;
        }

        if (selectedRooms.some(r => r._id === room._id)) {
            api.error({
                message: "Room Already Selected",
                description: "This room is already in your selection.",
            });
            return;
        }

        // Keep dates in local timezone for display
        const nights = Math.ceil(moment.duration(dates[1].diff(dates[0])).asDays());

        const updatedRoom = {
            ...room,
            // Store the dates exactly as selected in the date picker
            checkin: dates[0].format("YYYY-MM-DD HH:mm:ss"),
            checkout: dates[1].format("YYYY-MM-DD HH:mm:ss"),
            nights: nights,
            totalPrice: room.Price * nights
        };

        setSelectedRooms([...selectedRooms, updatedRoom]);
        setAvailableRooms(availableRooms.filter((r) => r._id !== room._id));
    };

    const handleRemoveRoom = (room) => {
        setSelectedRooms(selectedRooms.filter((r) => r._id !== room._id));
        if (room.Status === "Available") {
            setAvailableRooms([...availableRooms, room]);
        }
    };

    const handleDateChange = (value) => {
        setDates(value);
        setShowRoomTables(false);
    };

    // Function to disable past times
    const disabledTime = (current, type) => {
        if (!current || !current.isSame(moment(), 'day')) return {};

        const now = moment();
        return {
            disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
            disabledMinutes: (selectedHour) => {
                if (selectedHour === now.hour()) {
                    return Array.from({ length: now.minute() }, (_, i) => i);
                }
                return [];
            }
        };
    };

    const handleCheckAvailability = async () => {
        if (!dates[0] || !dates[1]) {
            api.error({
                message: "Select Dates First",
                description: "Please select the check-in and check-out dates before checking availability.",
            });
            return;
        }

        if (!selectedHotel) {
            api.error({
                message: "Select Hotel",
                description: "Please select a hotel before checking room availability.",
            });
            return;
        }

        setCheckingAvailability(true);
        try {
            const result = await checkRoomAvailability(
                dates[0].format("YYYY-MM-DD HH:mm:ss"),
                dates[1].format("YYYY-MM-DD HH:mm:ss"),
                selectedHotel
            );

            if (result.status === "OK") {
                setAvailableRooms(result.data);
                setShowRoomTables(true);
                api.success({
                    message: "Availability Checked",
                    description: "Room availability has been updated based on your selected dates.",
                });
            } else {
                api.error({
                    message: "Error",
                    description: result.message || "Failed to check room availability",
                });
            }
        } catch (error) {
            api.error({
                message: "Error",
                description: "An error occurred while checking room availability.",
            });
        } finally {
            setCheckingAvailability(false);
        }
    };

    const availableColumns = [
        {
            title: "Room Name",
            dataIndex: "RoomName",
            key: "RoomName",
            sorter: (a, b) => a.RoomName.localeCompare(b.RoomName),
            filterSearch: true,
            onFilter: (value, record) => record.RoomName.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: "Description",
            dataIndex: "Description",
            key: "Description",
            filterSearch: true,
            onFilter: (value, record) => record.Description.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: "Price",
            dataIndex: "Price",
            key: "Price",
            sorter: (a, b) => a.Price - b.Price,
            render: (text) => `${text} VND`
        },
        {
            title: "Status",
            dataIndex: "Status",
            key: "Status",
            render: (text) => (
                <span style={{ color: text === "Available" ? "green" : "red", fontWeight: "bold" }}>
                    {text}
                </span>
            ),
            filters: [
                { text: "Available", value: "Available" },
                { text: "Unavailable", value: "Unavailable" },
            ],
            onFilter: (value, record) => record.Status === value,
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button onClick={() => handleBookRoom(record)} type="primary">
                    Book
                </Button>
            ),
        },
    ];

    const selectedColumns = [
        { title: "Room Name", dataIndex: "RoomName", key: "RoomName" },
        { title: "Description", dataIndex: "Description", key: "Description" },
        {
            title: "Price/Night",
            dataIndex: "Price",
            key: "Price",
            render: (text) => `${text} VND`
        },
        {
            title: "Nights",
            dataIndex: "nights",
            key: "nights"
        },
        {
            title: "Total Price",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (text) => `${text} VND`
        },
        {
            title: "Status",
            dataIndex: "Status",
            key: "Status",
            render: (text) => (
                <span style={{ color: text === "Available" ? "green" : "red", fontWeight: "bold" }}>
                    {text}
                </span>
            )
        },
        { title: "Check-in", dataIndex: "checkin", key: "checkin", render: (text) => moment(text).format("YYYY-MM-DD HH:mm") },
        { title: "Check-out", dataIndex: "checkout", key: "checkout", render: (text) => moment(text).format("YYYY-MM-DD HH:mm") },
        {
            title: "Action",
            key: "action",
            render: (text, record) => (
                <Button onClick={() => handleRemoveRoom(record)} color="danger" variant="solid">
                    Remove
                </Button>
            ),
        },
    ];

    const handleAddService = (service, quantity) => {
        if (quantity <= 0) return;

        const totalPrice = service.Price * quantity;
        const newService = {
            serviceId: service._id,
            serviceName: service.ServiceName,
            pricePerUnit: service.Price,
            quantity,
            totalPrice,
        };

        // Prevent duplicate entries, update if already added
        setSelectedServices((prev) => {
            const existingIndex = prev.findIndex((s) => s.serviceId === service._id);
            if (existingIndex !== -1) {
                const updatedServices = [...prev];
                updatedServices[existingIndex] = newService;
                return updatedServices;
            }
            return [...prev, newService];
        });
    };

    const handleRemoveService = (serviceId) => {
        setSelectedServices(selectedServices.filter((s) => s.serviceId !== serviceId));
    };

    const serviceColumns = [
        {
            title: "Service Name",
            dataIndex: "ServiceName",
            key: "ServiceName",
            sorter: (a, b) => a.ServiceName.localeCompare(b.ServiceName),
            filterSearch: true,
            onFilter: (value, record) => record.ServiceName.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: "Price per Unit",
            dataIndex: "Price",
            key: "Price",
            sorter: (a, b) => a.Price - b.Price,
            render: (text) => `${text} VND`
        },
        {
            title: "Quantity",
            key: "quantity",
            render: (_, record) => (
                <InputNumber
                    min={1}
                    defaultValue={1}
                    onChange={(value) => handleAddService(record, value)}
                />
            ),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button onClick={() => handleAddService(record, 1)} type="primary">
                    Add
                </Button>
            ),
        },
    ];
    const selectedServiceColumns = [
        { title: "Service Name", dataIndex: "serviceName", key: "serviceName" },
        { title: "Quantity", dataIndex: "quantity", key: "quantity" },
        { title: "Price per Unit", dataIndex: "pricePerUnit", key: "pricePerUnit", render: (text) => `${text} VND` },
        { title: "Total Price", dataIndex: "totalPrice", key: "totalPrice", render: (text) => `${text} VND` },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button onClick={() => handleRemoveService(record.serviceId)} color="danger" variant="solid">
                    Remove
                </Button>
            ),
        },
    ];

    const handleSubmit = async () => {
        if (!form.getFieldValue("full_name") || !form.getFieldValue("phone") || !form.getFieldValue("cccd")) {
            api.error({
                message: "Missing Information",
                description: "Please fill in all customer information fields.",
            });
            return;
        }

        if (selectedRooms.length === 0) {
            api.error({
                message: "No Rooms Selected",
                description: "Please select at least one room before booking.",
            });
            return;
        }

        if (!dates[0] || !dates[1]) {
            api.error({
                message: "Missing Dates",
                description: "Please select check-in and check-out dates.",
            });
            return;
        }

        if (!paymentMethod) {
            api.error({
                message: "Missing Payment Method",
                description: "Please select a payment method.",
            });
            return;
        }

        if (paymentMethod === "Credit Card" && !paymentType) {
            api.error({
                message: "Missing Payment Type",
                description: "Please select a payment type for credit card payment.",
            });
            return;
        }

        setLoading(true);

        // Keep the exact dates selected by user
        const bookingData = {
            customer: {
                full_name: form.getFieldValue("full_name"),
                phone: form.getFieldValue("phone"),
                cccd: form.getFieldValue("cccd"),
            },
            rooms: selectedRooms.map(room => room._id),
            services: selectedServices.map(service => ({
                serviceId: service.serviceId,
                quantity: service.quantity,
            })),
            // Send the dates exactly as they were selected
            checkin: dates[0].format("YYYY-MM-DD HH:mm:ss"),
            checkout: dates[1].format("YYYY-MM-DD HH:mm:ss"),
            paymentMethod: paymentMethod,
            SumPrice: selectedRooms.reduce((total, room) => total + room.totalPrice, 0),
            Status: "Pending",
        };

        // Chuẩn bị dữ liệu giao dịch
        const transactionData = {
            services: selectedServices.map(service => ({
                serviceId: service.serviceId,
                quantity: service.quantity,
            })),
            FinalPrice: bookingData.SumPrice + selectedServices.reduce((total, service) => total + service.totalPrice, 0),
            PaidAmount: 0,
            PaymentMethod: paymentMethod,
            paymentType: paymentType,
            PaymentReference: paymentLink,
            CreatedBy: account.fullName,
        };

        try {
            const result = await createTransaction(bookingData, transactionData);
            if (result.status === "OK") {
                api.success({
                    message: "Booking Successful",
                    description: "Your booking has been created successfully.",
                });

                // Gửi thông báo đến Admin qua Socket.io

                // Cập nhật danh sách đặt phòng
                // fetchBookings();

                // Điều hướng đến danh sách đặt phòng
                navigate("/reservationlist");
            } else {
                api.error({
                    message: "Booking Failed",
                    description: result.message,
                });
            }
        } catch (error) {
            api.error({
                message: "Error",
                description: "An error occurred while creating the booking and transaction.",
            });
        }

        setLoading(false);
    };

    return (
        <div style={{ backgroundColor: "#F6F4F0", padding: "20px" }}>
            {contextHolder}
            <Form form={form} onFinish={onFinish}>
                {/* Customer Information Fields */}
                <Form.Item label="Full Name" name="full_name">
                    <Input onChange={(e) => handleFieldChange({ full_name: e.target.value })} />
                </Form.Item>
                <Form.Item label="Phone  " name="phone">
                    <Input onChange={(e) => handleFieldChange({ phone: e.target.value })} />
                </Form.Item>
                <Form.Item label="CCCD  " name="cccd">
                    <Input onChange={(e) => handleFieldChange({ cccd: e.target.value })} />
                </Form.Item>
                {/* Customer Warning */}
                {warningVisible && (
                    <Alert
                        message="Warning"
                        description="The customer is already exist in the system. Do you want to autofill?"
                        type="warning"
                        showIcon
                        action={
                            <>
                                <Button size="small" type="link" onClick={handleAutoFill}>Auto Fill</Button>
                                <Button size="small" type="link" onClick={handleCancelAutoFill}>Cancel</Button>
                            </>
                        }
                    />
                )}

                {/* Date Picker and Hotel Selection */}
                <Row gutter={16}>
                    <Col span={isAdmin ? 12 : 18}>
                        <Form.Item label="Check-in/Check-out Time" name="dates">
                            <RangePicker
                                format="YYYY-MM-DD HH:mm"
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
                    {isAdmin && (
                        <Col span={6}>
                            <Form.Item label="Select Hotel" name="hotel">
                                <Select
                                    value={selectedHotel}
                                    onChange={setSelectedHotel}
                                    placeholder="Select a hotel"
                                >
                                    {hotels.map(hotel => (
                                        <Select.Option key={hotel._id} value={hotel._id}>
                                            {hotel.NameHotel}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    )}
                    <Col span={6}>
                        <Form.Item>
                            <Button
                                type="primary"
                                onClick={handleCheckAvailability}
                                loading={checkingAvailability}
                                style={{ marginTop: "29px" }}
                            >
                                Check Availability
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Only show room tables after checking availability */}
                {showRoomTables && (
                    <>
                        {/* Available Rooms Table */}
                        <h2>Available Rooms</h2>
                        <Table
                            columns={availableColumns}
                            dataSource={availableRooms}
                            rowKey="_id"
                            locale={{ emptyText: 'No available rooms for selected dates' }}
                        />

                        {/* Selected Rooms Table */}
                        <h2>Selected Rooms</h2>
                        <Table
                            columns={selectedColumns}
                            dataSource={selectedRooms}
                            rowKey="_id"
                            locale={{ emptyText: 'No rooms selected' }}
                        />
                    </>
                )}

                {/* Services Table */}
                <Table columns={serviceColumns} dataSource={services} rowKey="_id" />

                {/* Selected Services Table */}
                <Table columns={selectedServiceColumns} dataSource={selectedServices} rowKey="serviceId" />

                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Form.Item label="Payment Method" name="paymentMethod">
                            <Select value={paymentMethod} onChange={handlePaymentChange}>
                                <Select.Option value="Cash">Cash</Select.Option>
                                <Select.Option value="Credit Card">Credit Card</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    {paymentMethod === "Credit Card" && (
                        <Col span={12}>
                            <Form.Item label="Payment Type">
                                <Select value={paymentType} onChange={handlePaymentTypeChange}>
                                    <Select.Option value="Partial Pay">Partial Pay 30%</Select.Option>
                                    <Select.Option value="Full Pay">Full Pay</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Card title="Total Summary" bordered={false} style={{ width: "100%", textAlign: "center" }}>
                    <Statistic title="Room Price" value={totalRoomPrice} suffix="đ" />
                    <Statistic title="Service Price" value={totalServicePrice} suffix="đ" />
                    <Statistic
                        title="Final Price"
                        value={finalPrice}
                        valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
                        suffix="đ"
                    />
                </Card>

                <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                >
                    Book Reservation
                </Button>
            </Form>
            <TestNotification />
        </div>
    );
};

export default ReservationPage;
