import React, { useState } from "react";
import { Form, Input, Upload, Button, Switch, Row, Col, notification } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { FormContainer, FullWidthItem } from "./style";
import { getBase64 } from "../../utils";
import * as HotelService from "../../services/HotelService";
import { UploadWrapper, ImageUploadSection, MainImagePreview, MainImagePreviewImg } from "./style";
import { useNavigate } from "react-router-dom";


const AddHotel = () => {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();


  const [stateHotel, setStateHotel] = useState({
    CodeHotel: "",
    NameHotel: "",
    Introduce: "",
    LocationHotel: "",
    image: "",
    Active: true,
  });

  const handleOnChangeImageDetails = async ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0];
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      setStateHotel(prev => ({ ...prev, image: file.preview }));
      form.setFieldsValue({ image: file.preview }); // Cập nhật vào form
    }
  };

  const handleFinish = async (values) => {

    const formData = {
      CodeHotel: values.hotelCode,
      NameHotel: values.hotelName,
      Introduce: values.introduction || "",
      LocationHotel: values.location,
      image: stateHotel.image || values.image,
      Active: values.Active || true,
    };

    // console.log("📤 Dữ liệu gửi lên BE:", formData);

    try {
      const response = await HotelService.createHotel(formData);

      if (response.status === "OK") {
        api.success({ message: "Hotel created successfully!" });
        form.resetFields();
        setStateHotel(prev => ({ ...prev, image: "", }));
        setTimeout(() => navigate("/hotel/hotel-list"), 2000);
      } else {
        api.error({ message: response.message || "Failed to create hotel." });
      }
    } catch (error) {
      console.error("❌ Create hotel error:", error);
      api.error({ message: "An error occurred while creating the hotel." });
    }
  };

  return (
    <FormContainer>
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={24}>
          <Col span={7}>
            <ImageUploadSection>
              {/* Ảnh Preview */}
              <MainImagePreview>
                {stateHotel.image ? (
                  <MainImagePreviewImg src={stateHotel.image} alt="Upload Image" />
                ) : (
                  <UploadOutlined style={{ fontSize: 24, color: "#999" }} />
                )}
              </MainImagePreview>

              {/* Upload ảnh */}
              <UploadWrapper>
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false}
                  maxCount={1}
                  showUploadList={false}
                  onChange={handleOnChangeImageDetails}
                >
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </UploadWrapper>
            </ImageUploadSection>
          </Col>
          <Col span={15} style={{ marginLeft: "20px" }}>
            <Row gutter={16} style={{ gap: "10px" }}>
              <Col span={8}>
                <Form.Item name="hotelCode" label="Hotel Code" rules={[{ required: true, message: "Please enter hotel code" }]}>
                  <Input placeholder="Enter hotel code" />
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item name="hotelName" label="Hotel Name" rules={[{ required: true, message: "Please enter hotel name" }]}>
                  <Input placeholder="Enter hotel name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} align="middle">
              <Col span={12}>
                <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter location" }]}>
                  <Input placeholder="Enter location" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="Active" label="Status" valuePropName="checked" style={{ minHeight: 32 }}>
                  <Switch defaultChecked={true} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 18 }} name="introduction" label="Introduction" rules={[{ required: true, message: "Please enter hotle introduction" }]}>
              <Input.TextArea style={{ width: "80%" }} placeholder="Enter introduction" />
            </Form.Item>

            <Button style={{ marginTop: 20, backgroundColor: "rgb(121, 215, 190)", borderColor: "rgb(121, 215, 190)", color: "black" }} htmlType="submit">
              Add Hotel
            </Button>
          </Col>

        </Row>

        <FullWidthItem>

        </FullWidthItem>
      </Form>
    </FormContainer>
  );
};

export default AddHotel;
