import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Switch, notification, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { createService, deleteService, getAllServices, updateService } from '../../services/ServiceService';
// import ModalComponent from '../../components/ModalComponent/ModalComponent';

const { Search } = Input;

const ServicePage = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [pageSize, setPageSize] = useState(5);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();

    const accessToken = localStorage.getItem("access_token");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        const response = await getAllServices();
        if (response.status === "OK") {
            setData(response.data);
            setFilteredData(response.data);
        } else {
            api.error({ message: "Error", description: response.message || "Failed to fetch services" });
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
        const filtered = data.filter(item =>
            item.ServiceName.toLowerCase().includes(value.toLowerCase()) ||
            item.Note.toLowerCase().includes(value.toLowerCase()) ||
            item.Price.toString().includes(value)
        );
        setFilteredData(filtered);
    };

    const showModal = (service = null) => {
        setSelectedService(service);
        form.setFieldsValue(service || { ServiceName: '', Price: "", Note: '', Active: true });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSave = async (values) => {
        if (selectedService) {
            const response = await updateService(selectedService._id, values, accessToken);
            if (response.status === "OK") {
                api.success({ message: "Success", description: "Service updated successfully" });
                fetchServices();
            } else {
                api.error({ message: "Error", description: response.message || "Failed to update service" });
            }
        } else {
            const response = await createService(values, accessToken);
            if (response.status === "OK") {
                api.success({ message: "Success", description: "Service created successfully" });
                fetchServices();
            } else {
                api.error({ message: "Error", description: response.message || "Failed to create service" });
            }
        }
        setIsModalVisible(false);
        form.resetFields();
    };

    // Hiển thị modal xóa
    const showDeleteModal = (service) => {
        setSelectedService(service);
        setIsDeleteModalVisible(true);
    };

    // Xử lý xóa service
    const handleDelete = async () => {
        if (!selectedService) return;

        setIsDeleting(true);

        try {
            const response = await deleteService(selectedService._id, accessToken);

            if (response?.status === "OK") {
                api.success({ message: "Success", description: response.message });

                setIsDeleteModalVisible(false);
                fetchServices();
            } else {
                api.error({ message: "Error", description: response?.message || "Failed to delete service" });
            }
        } catch (error) {
            api.error({ message: "Error", description: "Something went wrong while deleting the service" });
        } finally {
            setIsDeleting(false);
        }
    };


    const columns = [
        {
            title: 'Service Name',
            dataIndex: 'ServiceName',
            key: 'ServiceName',
            render: (text) => (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'Active',
            key: 'Active',
            render: (text) => text ? 'Active' : 'Inactive',
        },
        {
            title: 'Price',
            dataIndex: 'Price',
            key: 'Price',
            render: (price) => `${price.toLocaleString()} VND`,
        },
        {
            title: 'Note',
            dataIndex: 'Note',
            key: 'Note',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <EditOutlined
                        style={{
                            color: "orange",
                            fontSize: "20px",
                            cursor: "pointer",
                            backgroundColor: "#fff3e0",
                            padding: "8px",
                            borderRadius: "4px"
                        }}
                        onClick={() => showModal(record)}
                    />
                    <DeleteOutlined
                        style={{
                            color: "red",
                            fontSize: "20px",
                            cursor: "pointer",
                            backgroundColor: "#ffe0e0",
                            padding: "8px",
                            borderRadius: "4px"
                        }}
                        onClick={() => showDeleteModal(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            {contextHolder}
            <h2>Service List</h2>
            <Button style={{ backgroundColor: "rgb(121, 215, 190)", color: "black" }} type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                Add New
            </Button>
            <br /><br />

            <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Search
                    placeholder="Search services"
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                />
            </Space>

            {/* Table displaying data */}
            <Table
                dataSource={filteredData}
                columns={columns}
                pagination={{
                    pageSize: pageSize,
                    total: filteredData.length,
                    showSizeChanger: true,
                    onShowSizeChange: (current, size) => setPageSize(size),
                }}
                rowKey="_id"
                bordered
                style={{ width: '100%' }}
                scroll={{ y: 2000 }}
            />

            {/* Modal for adding/editing services */}
            <Modal
                title={selectedService ? "Edit Service" : "Add New Service"}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} onFinish={handleSave}>
                    <Form.Item
                        label="Service Name"
                        name="ServiceName"
                        rules={[{ required: true, message: 'Please enter the service name' },
                        { max: 255, message: 'Service name cannot exceed 255 characters' }
                        ]}
                    >
                        <Input placeholder="Service Name" />
                    </Form.Item>
                    <Form.Item
                        label="Price"
                        name="Price"
                        rules={[
                            { required: true, message: 'Please enter the price' },
                        ]}
                    >
                        <InputNumber style={{ width: "100%" }} placeholder="Must be greater than 0" />
                    </Form.Item>

                    <Form.Item
                        label="Note"
                        name="Note"
                        rules={[
                            {
                                max: 255,
                                message: 'Note cannot exceed 255 characters',
                            },
                        ]}
                    >
                        <Input.TextArea maxLength={255} showCount />
                    </Form.Item>
                    <Form.Item
                        label="Status"
                        name="Active"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                    <Button style={{ backgroundColor: "rgb(121, 215, 190)", color: "black" }} type="primary" htmlType="submit">
                        Save
                    </Button>
                </Form>
            </Modal>

            <Modal
                title="Delete Service"
                visible={isDeleteModalVisible}
                onOk={handleDelete}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Yes, Delete"
                cancelText="Cancel"
                confirmLoading={isDeleting}
            >
                <div>Are you sure you want to delete the service "{selectedService?.ServiceName}"?</div>
            </Modal>

        </div>
    );
};

export default ServicePage;