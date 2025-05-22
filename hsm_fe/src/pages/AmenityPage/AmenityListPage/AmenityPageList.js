import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, Input,
    Space, message, Popconfirm, Tabs, Tag, Alert, Switch, Tooltip, Dropdown
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    ExclamationCircleOutlined, UndoOutlined, DownOutlined, StopOutlined
} from '@ant-design/icons';
import * as amenityService from '../../../services/AmenityService';
import * as roomAmenityService from '../../../services/RoomAmenityService';

const { TabPane } = Tabs;
const { confirm } = Modal;

const AmenityListPage = () => {
    const [amenities, setAmenities] = useState([]);
    const [roomAmenities, setRoomAmenities] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [roomAmenitiesLoading, setRoomAmenitiesLoading] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAmenities();
        fetchRoomAmenities();
    }, [showDeleted]);

    const fetchAmenities = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await amenityService.getAllAmenities(showDeleted);
            if (response.status === "OK") {
                setAmenities(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch amenities');
            }
        } catch (error) {
            setError(error.message);
            message.error('Failed to fetch amenities');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomAmenities = async () => {
        try {
            setRoomAmenitiesLoading(true);
            const response = await roomAmenityService.getRoomAmenities();
            if (response.status === "OK") {
                setRoomAmenities(response.data);
            } else {
                message.error('Failed to fetch room amenities');
            }
        } catch (error) {
            message.error('Failed to fetch room amenities');
        } finally {
            setRoomAmenitiesLoading(false);
        }
    };

    const handleAdd = () => {
        form.resetFields();
        setEditingId(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        form.setFieldsValue({
            AmenitiesName: record.AmenitiesName,
            Note: record.Note
        });
        setEditingId(record._id);
        setIsModalVisible(true);
    };

    const handleHardDelete = async (id) => {
        try {
            const response = await amenityService.deleteAmenity(id);
            if (response.status === "OK") {
                message.success('Amenity deleted successfully');
                fetchAmenities();
            } else if (response.status === "ERR" && response.affectedRooms) {
                Modal.confirm({
                    title: 'Amenity in use',
                    content: `This amenity is currently used in ${response.affectedRooms} room(s). Would you like to soft delete it instead?`,
                    okText: 'Yes, Soft Delete',
                    cancelText: 'Cancel',
                    onOk: () => handleSoftDelete(id)
                });
            } else {
                message.error(response.message || 'Failed to delete amenity');
            }
        } catch (error) {
            message.error('Failed to delete amenity');
        }
    };

    const handleSoftDelete = async (id) => {
        try {
            const response = await amenityService.softDeleteAmenity(id);
            if (response.status === "OK") {
                message.success('Amenity soft deleted successfully');
                fetchAmenities();
            } else {
                message.error(response.message || 'Failed to soft delete amenity');
            }
        } catch (error) {
            message.error('Failed to soft delete amenity');
        }
    };

    const handleSubmit = async (values) => {
        try {
            let response;
            const data = {
                AmenitiesName: values.AmenitiesName,
                Note: values.Note || ''
            };

            if (editingId) {
                response = await amenityService.updateAmenity(editingId, data);
            } else {
                response = await amenityService.createAmenity(data);
            }

            if (response.status === "OK") {
                message.success(`Amenity ${editingId ? 'updated' : 'created'} successfully`);
                setIsModalVisible(false);
                fetchAmenities();
            } else {
                message.error(response.message || 'Operation failed');
            }
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Functioning': 'green',
            'Broken': 'red',
            'Missing': 'orange',
            'Other': 'grey'
        };
        return colors[status] || 'default';
    };

    const amenityColumns = [
        {
            title: 'Name',
            dataIndex: 'AmenitiesName',
            key: 'AmenitiesName',
            sorter: (a, b) => a.AmenitiesName.localeCompare(b.AmenitiesName),
            render: (text, record) => (
                <Space>
                    {text}
                    {record.IsDelete && <Tag color="red">Deleted</Tag>}
                </Space>
            )
        },
        {
            title: 'Note',
            dataIndex: 'Note',
            key: 'Note',
            ellipsis: true
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {!record.IsDelete && (
                        <>
                            <Tooltip title="Edit">
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(record)}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Delete this amenity?"
                                description="This will permanently delete the amenity if it's not in use, otherwise it will be soft deleted."
                                onConfirm={() => handleHardDelete(record._id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const roomAmenityColumns = [
        {
            title: 'Room',
            key: 'room',
            render: (_, record) => (
                <Space>
                    {record.room?.RoomName || 'N/A'}
                    {record.room?.Floor && <Tag color="blue">Floor {record.room.Floor}</Tag>}
                </Space>
            )
        },
        {
            title: 'Amenity',
            key: 'amenity',
            render: (_, record) => record.amenity?.AmenitiesName || 'N/A'
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            sorter: (a, b) => a.quantity - b.quantity
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
            ),
            filters: [
                { text: 'Functioning', value: 'Functioning' },
                { text: 'Broken', value: 'Broken' },
                { text: 'Missing', value: 'Missing' },
                { text: 'Other', value: 'Other' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Amenities List" key="1">
                    <div style={{ marginBottom: 16 }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <h2>Amenities Management</h2>
                            <Space>
                                <Switch
                                    checkedChildren="Show Deleted"
                                    unCheckedChildren="Hide Deleted"
                                    checked={showDeleted}
                                    onChange={setShowDeleted}
                                />
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAdd}
                                >
                                    Add Amenity
                                </Button>
                            </Space>
                        </Space>
                    </div>

                    {error && (
                        <Alert
                            message="Error"
                            description={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Table
                        columns={amenityColumns}
                        dataSource={amenities}
                        loading={loading}
                        rowKey="_id"
                        pagination={{
                            defaultPageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`
                        }}
                    />
                </TabPane>

                <TabPane tab="Room Amenities Status" key="2">
                    <div style={{ marginBottom: 16 }}>
                        <h2>Room Amenities Status</h2>
                    </div>

                    <Table
                        columns={roomAmenityColumns}
                        dataSource={roomAmenities}
                        loading={roomAmenitiesLoading}
                        rowKey="_id"
                        pagination={{
                            defaultPageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`
                        }}
                    />
                </TabPane>
            </Tabs>

            <Modal
                title={editingId ? "Edit Amenity" : "Add New Amenity"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="AmenitiesName"
                        label="Name"
                        rules={[{ required: true, message: 'Please input amenity name!' }]}
                    >
                        <Input placeholder="Enter amenity name" />
                    </Form.Item>

                    <Form.Item
                        name="Note"
                        label="Note"
                    >
                        <Input.TextArea
                            placeholder="Enter additional notes"
                            rows={4}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ float: 'right' }}>
                            <Button onClick={() => setIsModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingId ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AmenityListPage; 