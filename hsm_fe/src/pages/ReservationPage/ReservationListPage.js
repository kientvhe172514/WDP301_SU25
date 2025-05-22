import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Descriptions, message, Select, Tag, Space, Input, Form, InputNumber, Divider } from "antd";
import moment from "moment";
import { CopyOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { getAllTransactions } from "../../services/TransactionService";
import axios from "axios";

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const ReservationList = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [recentFilter, setRecentFilter] = useState("today");
    const [searchText, setSearchText] = useState("");

    // New state variables for modals
    const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
    const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
    const [availableServices, setAvailableServices] = useState([]);
    const [form] = Form.useForm();
    const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
    const [isPaymentLinkModalVisible, setIsPaymentLinkModalVisible] = useState(false);
    const [generatedPaymentLink, setGeneratedPaymentLink] = useState('');

    useEffect(() => {
        fetchTransactions();
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get(`${API_URL}/services`);
            if (response.data.status === "OK") {
                setAvailableServices(response.data.data);
            }
        } catch (error) {
            message.error("Failed to fetch services");
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        const response = await getAllTransactions();
        if (response.status !== "ERR") {
            setTransactions(response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
        } else {
            message.error("Failed to fetch transactions");
        }
        setLoading(false);
    };

    const showDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setIsModalVisible(true);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        message.success("Copied to clipboard");
    };

    const getStatusTag = (status) => {
        const colorMap = { Completed: "green", Pending: "orange", Cancelled: "red" };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
    };

    const getPaymentTag = (paymentStatus) => {
        const colorMap = { Paid: "green", Partial: "gold", Unpaid: "red" };
        return <Tag color={colorMap[paymentStatus] || "default"}>{paymentStatus}</Tag>;
    };

    const today = moment().startOf("day");
    const thisWeek = moment().startOf("week");

    const filteredRecentTransactions = transactions.filter((t) => {
        const updatedAt = moment(t.updatedAt);
        return recentFilter === "today"
            ? updatedAt.isSame(today, "day")
            : updatedAt.isSameOrAfter(thisWeek, "day");
    });

    const unpaidTransactions = transactions.filter((t) => t.Pay === "Unpaid");
    const partialTransactions = transactions.filter((t) => t.Pay === "Partial");

    const filteredTransactions = transactions.filter(
        (t) =>
            t._id.toLowerCase().includes(searchText.toLowerCase()) ||
            t.Status.toLowerCase().includes(searchText.toLowerCase()) ||
            t.Pay.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "Transaction ID",
            dataIndex: "_id",
            key: "_id",
            sorter: (a, b) => a._id.localeCompare(b._id),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search Transaction ID"
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={confirm}
                        style={{ width: 188, marginBottom: 8, display: "block" }}
                    />
                    <Button
                        type="primary"
                        onClick={confirm}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                </div>
            ),
        },
        {
            title: "Room Name",
            dataIndex: "bookings",
            key: "RoomName",
            render: (bookings) => {
                if (!bookings || bookings.length === 0) return "No Room"; // Nếu không có booking nào

                // Lấy tất cả RoomName từ các bookings
                const roomNames = bookings.map(booking => booking.rooms?.RoomName || "No Room");

                return roomNames.join(", ");
            }
        },
        {
            title: "Check In - Check Out",
            dataIndex: "bookings",
            key: "CheckInCheckOut",
            render: (bookings) => {
                if (!bookings || bookings.length === 0) return "No Data"; // Nếu không có booking nào

                // Lấy tất cả thời gian check-in và check-out
                const times = bookings.map(booking => {
                    const checkIn = booking.Time?.Checkin ? new Date(booking.Time.Checkin).toLocaleString() : "N/A";
                    const checkOut = booking.Time?.Checkout ? new Date(booking.Time.Checkout).toLocaleString() : "N/A";
                    return `${checkIn} - ${checkOut}`;
                });

                return times.join(" | "); // Ghép nhiều thời gian với dấu "|"
            }
        },
        {
            title: "Final Price",
            dataIndex: "FinalPrice",
            key: "FinalPrice",
            sorter: (a, b) => a.FinalPrice - b.FinalPrice,
            render: (price) => `${price.toLocaleString()} VND`,
        },
        {
            title: "Paid Amount",
            dataIndex: "PaidAmount",
            key: "PaidAmount",
            sorter: (a, b) => a.PaidAmount - b.PaidAmount,
            render: (amount) => `${amount.toLocaleString()} VND`,
        },
        {
            title: "Payment Status",
            dataIndex: "Pay",
            key: "Pay",
            render: (status) => getPaymentTag(status),
        },
        {
            title: "Status",
            dataIndex: "Status",
            key: "Status",
            render: (status) => getStatusTag(status),
        },
        {
            title: "Updated At",
            dataIndex: "updatedAt",
            key: "updatedAt",
            sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
            render: (date) => moment(date).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Button type="primary" onClick={() => showDetails(record)}>
                    Detail
                </Button>
            ),
        },
    ];

    const handleAddExtraService = async (values) => {
        try {
            const response = await axios.post(
                `${API_URL}/transactions/${selectedTransaction._id}/add-services`,
                { services: values.services }
            );
            if (response.data.status === "OK") {
                message.success("Extra services added successfully");
                setIsServiceModalVisible(false);
                fetchTransactions();
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error("Failed to add extra services");
        }
    };

    const handleStatusChange = async (values) => {
        try {
            const response = await axios.put(
                `${API_URL}/transactions/${selectedTransaction._id}/status`,
                { status: values.status }
            );
            if (response.data.status === "OK") {
                message.success("Status updated successfully");
                setIsStatusModalVisible(false);
                fetchTransactions();
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error("Failed to update status");
        }
    };

    const handleInfoUpdate = async (values) => {
        try {
            const response = await axios.put(
                `${API_URL}/transactions/${selectedTransaction._id}/information`,
                values
            );
            if (response.data.status === "OK") {
                message.success("Information updated successfully");
                setIsInfoModalVisible(false);
                fetchTransactions();
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error("Failed to update information");
        }
    };

    const handleGeneratePaymentLink = async () => {
        try {
            setIsGeneratingPayment(true);
            const remainingAmount = selectedTransaction.FinalPrice - selectedTransaction.PaidAmount;

            // Get client IP address

            const ipAddr = "http://localhost:3000";

            const response = await axios.post(`${API_URL}/transactions/create_payment_url`, {
                amount: remainingAmount,
                description: `Payment for transaction ${selectedTransaction._id}`,
                ipAddr: "http://localhost:3000",
                transactionId: selectedTransaction._id
            });

            if (response.data.status === "OK" && response.data.paymentUrl) {
                // Update the transaction with the new payment link
                const updateResponse = await axios.put(
                    `${API_URL}/transactions/${selectedTransaction._id}/information`,
                    {
                        PaymentReference: response.data.paymentUrl
                    }
                );

                if (updateResponse.data.status === "OK") {
                    message.success("Payment link generated successfully");
                    // Set the payment link and show the modal
                    setGeneratedPaymentLink(response.data.paymentUrl);
                    setIsPaymentLinkModalVisible(true);
                    // Update the selected transaction in state
                    setSelectedTransaction({
                        ...selectedTransaction,
                        PaymentReference: response.data.paymentUrl
                    });
                    // Refresh the transactions list
                    await fetchTransactions();
                } else {
                    message.error("Failed to update payment reference");
                }
            } else {
                message.error(response.data.message || "Failed to generate payment link");
            }
        } catch (error) {
            console.error("Error generating payment link:", error);
            message.error("Failed to generate payment link");
        } finally {
            setIsGeneratingPayment(false);
        }
    };

    const renderTransactionDetails = () => (
        <>
            <Descriptions column={1} bordered>
                <Descriptions.Item label="Buy Time">
                    {moment(selectedTransaction.BuyTime).format("YYYY-MM-DD HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Final Price">
                    {selectedTransaction.FinalPrice.toLocaleString()} VND
                </Descriptions.Item>
                <Descriptions.Item label="Paid Amount">
                    {selectedTransaction.PaidAmount.toLocaleString()} VND
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                    {getPaymentTag(selectedTransaction.Pay)}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                    {getStatusTag(selectedTransaction.Status)}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                    {selectedTransaction.PaymentMethod}
                </Descriptions.Item>
                {selectedTransaction.PaymentReference && (
                    <Descriptions.Item label="Payment Reference">
                        <a href={selectedTransaction.PaymentReference} target="_blank" rel="noopener noreferrer">
                            Payment Link
                        </a>
                        <Button
                            type="link"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopy(selectedTransaction.PaymentReference)}
                        />
                    </Descriptions.Item>
                )}
            </Descriptions>

            <div style={{ marginTop: 20, textAlign: "center" }}>
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            setIsModalVisible(false);
                            setIsServiceModalVisible(true);
                        }}
                    >
                        Add Extra Service
                    </Button>
                    <Button
                        type="default"
                        onClick={() => {
                            setIsModalVisible(false);
                            setIsStatusModalVisible(true);
                        }}
                    >
                        Change Booking Status
                    </Button>
                    <Button
                        type="dashed"
                        onClick={() => {
                            setIsModalVisible(false);
                            setIsInfoModalVisible(true);
                        }}
                    >
                        Edit Information
                    </Button>
                </Space>
            </div>
            {selectedTransaction?.PaymentMethod === "Credit Card" && selectedTransaction?.Pay !== "Paid" && (
                <div style={{ marginTop: 12, textAlign: "center" }}>
                    <Button
                        type="primary"
                        ghost
                        loading={isGeneratingPayment}
                        onClick={handleGeneratePaymentLink}
                        icon={<CopyOutlined />}
                    >
                        Generate New Payment Link
                    </Button>
                </div>
            )}
        </>
    );

    const renderExtraServicesModal = () => (
        <Modal
            title="Add Extra Services"
            open={isServiceModalVisible}
            onCancel={() => setIsServiceModalVisible(false)}
            width={"1000px"}
            footer={null}
        >
            {selectedTransaction && (
                <>
                    <h3>Existing Services</h3>
                    <Table
                        dataSource={selectedTransaction.services}
                        columns={[
                            {
                                title: 'Service Name',
                                dataIndex: ['serviceId', 'ServiceName'],
                                key: 'serviceName',
                            },
                            {
                                title: 'Quantity',
                                dataIndex: 'quantity',
                                key: 'quantity',
                            },
                            {
                                title: 'Price per Unit',
                                dataIndex: 'pricePerUnit',
                                key: 'pricePerUnit',
                                render: (price) => `${price?.toLocaleString()} VND`,
                            },
                            {
                                title: 'Total Price',
                                dataIndex: 'totalPrice',
                                key: 'totalPrice',
                                render: (price) => `${price?.toLocaleString()} VND`,
                            },
                        ]}
                        pagination={false}
                        rowKey={(record) => record.serviceId._id}
                    />

                    <Divider />
                    <h3>Add New Services</h3>
                    <Form onFinish={handleAddExtraService} form={form}>
                        <Form.List name="services">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Space key={field.key} align="baseline">
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'serviceId']}
                                                rules={[{ required: true, message: 'Select a service' }]}
                                            >
                                                <Select style={{ width: 200 }} placeholder="Select service">
                                                    {availableServices.map(service => (
                                                        <Option key={service._id} value={service._id}>
                                                            {service.ServiceName} - {service.Price} VND
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'quantity']}
                                                rules={[{ required: true, message: 'Input quantity' }]}
                                            >
                                                <InputNumber min={1} placeholder="Quantity" />
                                            </Form.Item>
                                            <Button onClick={() => remove(field.name)} danger>
                                                Delete
                                            </Button>
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add Service
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            )}
        </Modal >
    );

    const renderStatusModal = () => (
        <Modal
            title="Change Booking Status"
            open={isStatusModalVisible}
            onCancel={() => setIsStatusModalVisible(false)}
            footer={null}
        >
            <Form onFinish={handleStatusChange}>
                <Form.Item
                    name="status"
                    rules={[{ required: true, message: 'Please select a status' }]}
                >
                    <Select placeholder="Select new status">
                        <Option value="Pending">
                            <Tag color="orange">Pending</Tag>
                        </Option>
                        <Option value="Completed">
                            <Tag color="green">Completed</Tag>
                        </Option>
                        <Option value="Cancelled">
                            <Tag color="red">Cancelled</Tag>
                        </Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Update Status
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );

    const renderEditInfoModal = () => (
        <Modal
            title="Edit Transaction Information"
            open={isInfoModalVisible}
            onCancel={() => setIsInfoModalVisible(false)}
            footer={null}
        >
            <Form
                onFinish={handleInfoUpdate}
                initialValues={{
                    PaidAmount: selectedTransaction?.PaidAmount || 0,
                    PaymentMethod: selectedTransaction?.PaymentMethod || 'Cash'
                }}
            >
                <Form.Item
                    name="PaidAmount"
                    label="Paid Amount"
                    rules={[{ required: true, message: 'Please input paid amount' }]}
                >
                    <InputNumber
                        min={0}
                        max={selectedTransaction?.FinalPrice || 0}
                        style={{ width: '100%' }}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        placeholder="Enter paid amount"
                    />
                </Form.Item>
                <Form.Item
                    name="PaymentMethod"
                    label="Payment Method"
                    rules={[{ required: true, message: 'Please select payment method' }]}
                >
                    <Select placeholder="Select payment method">
                        <Option value="Cash">Cash</Option>
                        <Option value="Credit Card">Credit Card</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Update Information
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );

    return (
        <div>
            {/* Search Bar */}
            <Input
                placeholder="Search by ID, Status, Payment"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ marginBottom: 16, width: 300 }}
            />

            {/* All Reservations */}
            <h2>All Reservations</h2>
            <Table columns={columns} dataSource={filteredTransactions} rowKey="_id" loading={loading} />

            {/* Recent Reservations */}
            <h2>Recent Reservations</h2>
            <Select value={recentFilter} onChange={setRecentFilter} style={{ width: 150, marginBottom: 10 }}>
                <Option value="today">Today</Option>
                <Option value="week">This Week</Option>
            </Select>
            <Table columns={columns} dataSource={filteredRecentTransactions} rowKey="_id" loading={loading} />

            {/* Unpaid Transactions */}
            <h2 style={{ color: "red", marginTop: 20 }}>Unpaid Transactions</h2>
            <Table columns={columns} dataSource={unpaidTransactions} rowKey="_id" loading={loading} />

            {/* Partial Payments */}
            <h2 style={{ color: "gold", marginTop: 20 }}>Partial Payments</h2>
            <Table columns={columns} dataSource={partialTransactions} rowKey="_id" loading={loading} />

            {renderExtraServicesModal()}
            {renderStatusModal()}
            {renderEditInfoModal()}

            {/* Transaction Details Modal */}
            <Modal
                title="Transaction Details"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                {selectedTransaction && renderTransactionDetails()}
            </Modal>

            {/* Payment Link Modal */}
            <Modal
                title="Generated Payment Link"
                open={isPaymentLinkModalVisible}
                onCancel={() => setIsPaymentLinkModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsPaymentLinkModalVisible(false)}>
                        Close
                    </Button>,
                    <Button
                        key="copy"
                        type="primary"
                        icon={<CopyOutlined />}
                        onClick={() => {
                            navigator.clipboard.writeText(generatedPaymentLink);
                            message.success("Payment link copied to clipboard");
                        }}
                    >
                        Copy Link
                    </Button>
                ]}
            >
                <Input.TextArea
                    value={generatedPaymentLink}
                    readOnly
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    style={{ marginBottom: 16 }}
                />

            </Modal>
        </div>
    );
};

export default ReservationList;
