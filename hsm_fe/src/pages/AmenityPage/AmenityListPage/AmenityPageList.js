import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Tabs,
  Tag,
  Alert,
  Switch,
  Tooltip,
  Dropdown,
  Upload,
  notification,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  UndoOutlined,
  DownOutlined,
  StopOutlined,
  UploadOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import * as amenityService from "../../../services/AmenityService";
import * as roomAmenityService from "../../../services/RoomAmenityService";
import * as XLSX from "xlsx";

const { TabPane } = Tabs;
const { confirm } = Modal;
const { useNotification } = notification;

const AmenityListPage = () => {
  const [amenities, setAmenities] = useState([]);
  const [roomAmenities, setRoomAmenities] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomAmenitiesLoading, setRoomAmenitiesLoading] = useState(false);
  const [api, contextHolder] = useNotification();

  const [error, setError] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetchAmenities();
    fetchRoomAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await amenityService.getAllAmenities();
      if (response.status === "OK") {
        setAmenities(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch amenities");
      }
    } catch (error) {
      setError(error.message);
      message.error("Failed to fetch amenities");
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
        message.error("Failed to fetch room amenities");
      }
    } catch (error) {
      message.error("Failed to fetch room amenities");
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
      Note: record.Note,
    });
    setEditingId(record._id);
    setIsModalVisible(true);
  };

  const handleSoftDelete = async (id) => {
    try {
      setIsDeleting(true);
      const response = await amenityService.deleteAmenity(id);
      if (response.status === "SUCCESS") {
        api.success({
          message: "Success",
          description: "Amenity soft deleted successfully",
        });
        setIsDeleteModalVisible(false);
        setSelectedAmenity(null);
        fetchAmenities();
      } else {
        api.error({
          message: "Error",
          description: response.message || "Failed to soft delete amenity",
        });
      }
    } catch (error) {
      api.error({
        message: "Error",
        description: "Something went wrong while soft deleting the amenity",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      let response;
      const data = {
        AmenitiesName: values.AmenitiesName,
        Note: values.Note || "",
      };

      if (editingId) {
        response = await amenityService.updateAmenity(editingId, data);
      } else {
        response = await amenityService.createAmenity(data);
      }

      if (response.status === "OK") {
        message.success(
          `Amenity ${editingId ? "updated" : "created"} successfully`
        );
        setIsModalVisible(false);
        fetchAmenities();
      } else {
        const errorMessage = response.message || "Operation failed";

        if (
          errorMessage.toLowerCase().includes("amenity") &&
          errorMessage.toLowerCase().includes("exist")
        ) {
          form.setFields([
            {
              name: "AmenitiesName",
              errors: [errorMessage],
            },
          ]);
        }

        message.error(errorMessage);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      message.error("Operation failed");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Functioning: "green",
      Broken: "red",
      Missing: "orange",
      Other: "grey",
    };
    return colors[status] || "default";
  };

  const amenityColumns = [
    {
      title: "Name",
      dataIndex: "AmenitiesName",
      key: "AmenitiesName",
      sorter: (a, b) => a.AmenitiesName.localeCompare(b.AmenitiesName),
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
              <Tooltip title="Edit">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setSelectedAmenity(record);
                  setIsDeleteModalVisible(true);
                }}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  const roomAmenityColumns = [
    {
      title: "Room",
      key: "room",
      render: (_, record) => (
        <Space>
          {record.room?.RoomName || "N/A"}
          {record.room?.Floor && (
            <Tag color="blue">Floor {record.room.Floor}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Amenity",
      key: "amenity",
      render: (_, record) => record.amenity?.AmenitiesName || "N/A",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
      filters: [
        { text: "Functioning", value: "Functioning" },
        { text: "Broken", value: "Broken" },
        { text: "Missing", value: "Missing" },
        { text: "Other", value: "Other" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
  ];

  const handleExcelPreview = async (file) => {
    try {
      setPreviewLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await amenityService.previewAmenities(formData);
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

  const handleImportConfirm = async () => {
    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append("file", previewData.file);

      const response = await amenityService.importAmenities(formData);
      if (response.status === "OK" || response.status === "PARTIAL_SUCCESS") {
        message.success(
          response.status === "PARTIAL_SUCCESS"
            ? `Import successfully ${response.summary.success} rows, ${response.summary.failed} rows error`
            : "Import successfully"
        );
        setIsPreviewModalVisible(false);
        setPreviewData(null);
        fetchAmenities();
      } else {
        message.error(response.message || "Import failed");
      }
    } catch (error) {
      message.error("Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const previewColumns = [
    {
      title: "Row",
      dataIndex: "row",
      key: "row",
      width: 80,
    },
    {
      title: "Amenity Name",
      dataIndex: "AmenitiesName",
      key: "AmenitiesName",
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
        <TabPane tab="Amenities List" key="1">
          <div style={{ marginBottom: 16 }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <h2>Amenities Management</h2>
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
              showTotal: (total) => `Total ${total} items`,
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
              showTotal: (total) => `Total ${total} items`,
            }}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={editingId ? "Edit Amenity" : "Add New Amenity"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="AmenitiesName"
            label="Name"
            rules={[{ required: true, message: "Please input amenity name!" }]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <Input
              placeholder="Enter amenity name"
              onChange={() => {
                // Xóa lỗi khi người dùng thay đổi giá trị
                form.setFields([
                  {
                    name: "AmenitiesName",
                    errors: [],
                  },
                ]);
              }}
            />
          </Form.Item>

          <Form.Item name="Note" label="Note">
            <Input.TextArea placeholder="Enter additional notes" rows={4} />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingId ? "Update" : "Create"}
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
            Import Data
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
        title="Delete Amenity"
        open={isDeleteModalVisible}
        onOk={() => handleSoftDelete(selectedAmenity?._id)}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setSelectedAmenity(null);
        }}
        okText="Yes, Delete"
        cancelText="Cancel"
        confirmLoading={isDeleting}
      >
        <div>
          Are you sure you want to delete the amenity "
          {selectedAmenity?.AmenitiesName}"?
        </div>
      </Modal>
    </div>
  );
};

export default AmenityListPage;
