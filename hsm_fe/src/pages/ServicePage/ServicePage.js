import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Switch,
  notification,
  InputNumber,
  Tabs,
  Tag,
  Alert,
  Upload,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  createService,
  deleteService,
  getAllServices,
  updateService,
  previewServicesFromExcel,
  importServicesFromExcel,
} from "../../services/ServiceService";

const { Search } = Input;
const { TabPane } = Tabs;

const ServicePage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [form] = Form.useForm();
  const [importLoading, setImportLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllServices();
      if (response.status === "SUCCESS") {
        setData(response.data);
        setFilteredData(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch services");
      }
    } catch (error) {
      setError(error.message);
      api.error({
        message: "Error",
        description: error.message || "Failed to fetch services",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = data.filter(
      (item) =>
        item.ServiceName.toLowerCase().includes(value.toLowerCase()) ||
        item.Note.toLowerCase().includes(value.toLowerCase()) ||
        item.Price.toString().includes(value)
    );
    setFilteredData(filtered);
  };

  const showModal = (service = null) => {
    setSelectedService(service);
    form.setFieldsValue(
      service || { ServiceName: "", Price: "", Note: "", Active: true }
    );
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSave = async (values) => {
    try {
      let response;
      if (selectedService) {
        response = await updateService(
          selectedService._id,
          values,
          accessToken
        );
      } else {
        // response = await createService(values, accessToken);
        response = await createService(values);
      }

      if (response.status === "SUCCESS") {
        api.success({
          message: "Success",
          description: `Service ${
            selectedService ? "updated" : "created"
          } successfully`,
        });
        setIsModalVisible(false);
        fetchServices();
      } else {
        const errorMessage = response.message || "Operation failed";
        if (
          errorMessage.toLowerCase().includes("service") &&
          errorMessage.toLowerCase().includes("exist")
        ) {
          form.setFields([
            {
              name: "ServiceName",
              errors: [errorMessage],
            },
          ]);
        }
        api.error({ message: "Error", description: errorMessage });
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      api.error({ message: "Error", description: "Operation failed" });
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    setIsDeleting(true);

    try {
      // const response = await deleteService(selectedService._id, accessToken);
      const response = await deleteService(selectedService._id);
      console.log("Delete response:", response);

      if (response?.status === "SUCCESS") {
        api.success({
          message: "Success",
          description: response.message || "Service deleted successfully",
        });
        setIsDeleteModalVisible(false);
        setSelectedService(null);
        fetchServices();
      } else {
        api.error({
          message: "Error",
          description: response?.message || "Failed to delete service",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      api.error({
        message: "Error",
        description:
          error.response?.data?.message ||
          "Something went wrong while deleting the service",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      title: "Service Name",
      dataIndex: "ServiceName",
      key: "ServiceName",
      sorter: (a, b) => a.ServiceName.localeCompare(b.ServiceName),
      render: (text, record) => (
        <Space>
          <span
            style={{
              opacity: record.IsDelete ? 0.5 : 1,
              textDecoration: record.IsDelete ? "line-through" : "none",
            }}
          >
            {text}
          </span>
          {record.IsDelete && <Tag color="red">Deleted</Tag>}
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "Price",
      key: "Price",
      sorter: (a, b) => a.Price - b.Price,
      render: (price, record) => (
        <span
          style={{
            opacity: record.IsDelete ? 0.5 : 1,
            textDecoration: record.IsDelete ? "line-through" : "none",
          }}
        >
          {price.toLocaleString()} VND
        </span>
      ),
    },
    {
      title: "Note",
      dataIndex: "Note",
      key: "Note",
      ellipsis: true,
      render: (text, record) => (
        <span
          style={{
            opacity: record.IsDelete ? 0.5 : 1,
            textDecoration: record.IsDelete ? "line-through" : "none",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {!record.IsDelete && (
            <>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => showModal(record)}
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setSelectedService(record);
                  setIsDeleteModalVisible(true);
                }}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleImportConfirm = async () => {
    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append("file", previewData.file);
      const response = await importServicesFromExcel(formData);
      if (response.status === "OK" || response.status === "PARTIAL_SUCCESS") {
        message.success(
          response.status === "PARTIAL_SUCCESS"
            ? `Import successfully ${response.summary.success} rows, ${response.summary.failed} rows error`
            : "Import successfully"
        );
        setIsPreviewModalVisible(false);
        setPreviewData(null);
        fetchServices();
      } else {
        message.error(response.message || "Import failed");
      }
    } catch (error) {
      console.error("Import error:", error);
      message.error(error.response?.data?.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const handleExcelPreview = async (file) => {
    try {
      setPreviewLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await previewServicesFromExcel(formData);
      if (response.status === "OK") {
        setPreviewData({
          ...response.data,
          file: file,
        });
        setIsPreviewModalVisible(true);
      } else {
        message.error(response.message || "Failed to preview Excel file");
      }
    } catch (error) {
      message.error("Failed to preview Excel file");
    } finally {
      setPreviewLoading(false);
    }
    return false; // Prevent default upload
  };

  const previewColumns = [
    {
      title: "Row",
      dataIndex: "row",
      key: "row",
      width: 80,
    },
    {
      title: "Service Name",
      dataIndex: "ServiceName",
      key: "ServiceName",
      render: (text, record) => (
        <span style={{ color: record.error ? "red" : "inherit" }}>
          {text || "Missing"}
        </span>
      ),
    },
    {
      title: "Price",
      dataIndex: "Price",
      key: "Price",
      render: (text, record) => (
        <span style={{ color: record.error ? "red" : "inherit" }}>
          {text || "Missing"}
        </span>
      ),
    },
    {
      title: "Note",
      dataIndex: "Note",
      key: "Note",
      render: (text, record) => (
        <span style={{ color: record.error ? "red" : "inherit" }}>
          {text || ""}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) =>
        record.error ? (
          <Tag color="red">{record.error}</Tag>
        ) : (
          <Tag color="green">Valid</Tag>
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Tabs defaultActiveKey="1">
        <TabPane tab="Services List" key="1">
          <div style={{ marginBottom: 16 }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <h2>Services Management</h2>
              <Space>
                <Upload
                  accept=".xlsx,.xls"
                  showUploadList={false}
                  beforeUpload={handleExcelPreview}
                >
                  <Button icon={<UploadOutlined />} loading={previewLoading}>
                    Import Excel
                  </Button>
                </Upload>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                >
                  Add Service
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

          <Space style={{ marginBottom: 16 }}>
            <Search
              placeholder="Search services"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
          </Space>

          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="_id"
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
            }}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={selectedService ? "Edit Service" : "Add New Service"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="ServiceName"
            label="Name"
            rules={[
              { required: true, message: "Please input service name!" },
              {
                max: 255,
                message: "Service name cannot exceed 255 characters",
              },
            ]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <Input
              placeholder="Enter service name"
              onChange={() => {
                form.setFields([
                  {
                    name: "ServiceName",
                    errors: [],
                  },
                ]);
              }}
            />
          </Form.Item>

          <Form.Item
            name="Price"
            label="Price"
            rules={[{ required: true, message: "Please enter the price" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Must be greater than 0"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="Note"
            label="Note"
            rules={[
              {
                max: 255,
                message: "Note cannot exceed 255 characters",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Enter additional notes"
              rows={4}
              maxLength={255}
              showCount
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {selectedService ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Preview Excel Data"
        open={isPreviewModalVisible}
        onCancel={() => {
          setIsPreviewModalVisible(false);
          setPreviewData(null);
        }}
        width={800}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsPreviewModalVisible(false);
              setPreviewData(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="import"
            type="primary"
            icon={<CheckOutlined />}
            loading={importLoading}
            onClick={handleImportConfirm}
            disabled={
              !previewData?.data?.length || previewData?.summary?.success === 0
            }
          >
            Import Valid Data
          </Button>,
        ]}
      >
        <Alert
          message="Data Preview"
          description={
            <div>
              <p>Please review the data before importing.</p>
              {previewData?.summary && (
                <p>
                  Total: {previewData.summary.total} | Valid:{" "}
                  {previewData.summary.success} | Invalid:{" "}
                  {previewData.summary.failed}
                </p>
              )}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Table
          columns={previewColumns}
          dataSource={previewData?.data || []}
          rowKey="row"
          pagination={false}
          scroll={{ y: 400 }}
        />
      </Modal>
      <Modal
        title="Delete Service"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Yes, Delete"
        cancelText="Cancel"
        confirmLoading={isDeleting}
      >
        <div>
          Are you sure you want to delete the service "
          {selectedService?.ServiceName}"?
        </div>
      </Modal>
    </div>
  );
};

export default ServicePage;
