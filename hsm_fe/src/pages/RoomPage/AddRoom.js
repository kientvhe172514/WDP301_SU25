import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Button, Upload, Row, Col, notification, Table, Space, Popconfirm, } from "antd";
import { MinusOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { RoomFormContainer, ImageUploadSection, MainImagePreview, MainImagePreviewImg, StyledRadioGroup, StyledRadioButton, } from "./AddRoomStyle";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as RoomService from "../../services/RoomService";
import * as HotelService from "../../services/HotelService";
import * as AmenityService from "../../services/AmenityService";
import * as RoomAmenityService from "../../services/RoomAmenitiesService";
import { convertPrice, getBase64, renderOptions } from "../../utils";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import { useNavigate } from "react-router-dom";
import { Tooltip, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons"

const { Option } = Select;

const AddRoomForm = ({ initialValues }) => {
    const [mode, setMode] = useState("single");
    const [form] = Form.useForm();
    const [formBulk] = Form.useForm();
    const [imageList, setImageList] = useState(initialValues?.Imgae || []);
    const [quantity, setQuantity] = useState(1);
    const [rooms, setRooms] = useState([]);
    const [api, contextHolder] = notification.useNotification();
    const [amenities, setAmenities] = useState([]);
    const [status, setStatus] = useState("");
    const [isModalConfirm, setIsModalConfirm] = useState(false);
    const [amenitiesQuantity, setAmenitiesQuantity] = useState({});
    const [selectedAmenityId, setSelectedAmenityId] = useState(null);
    const [currentForm, setCurrentForm] = useState("single"); // "single" hoặc "bulk"
    const navigate = useNavigate();

    const [stateRoom, setStateRoom] = useState({
        roomName: "", price: "", roomType: [], floor: "", hotel: [], image: "", description: "", quantity: "",
    });

    //create room amenities
    const mutationCreateRoomAmenities = useMutation({
        mutationFn: (data) => RoomAmenityService.createRoomAmenity(data),
    });

    //create room amenities
    const { data: dataroomamenities, isSuccessamenities, isErroramenities } = mutationCreateRoomAmenities;

    //create room
    const mutationCreate = useMutation({
        mutationFn: (data) => RoomService.createRoom(data),
    });

    //create room
    const { data: datarooms, isSuccess, isError } = mutationCreate;

    //get hotels
    const { data: dataHotel } = useQuery({
        queryKey: ["hotels"],
        queryFn: HotelService.getAllHotel,
    });

    const hotels = dataHotel?.data || [];
    // console.log("hotels:", hotels);

    // Chuyển roomTypes thành object để dễ lookup
    const hotelsMap = hotels.reduce((acc, type) => {
        acc[type._id] = type.NameHotel;
        return acc;
    }, {});
    // console.log("hotelsMap:", hotelsMap);

    //get rooms 
    const { data: existingRoomsData } = useQuery({
        queryKey: ["existingRooms"],
        queryFn: RoomService.getAllRoom, // API lấy danh sách phòng hiện tại
    });
    const existingRooms = existingRoomsData?.data || [];

    //get room types
    const { data: dataRoomType, isLoading } = useQuery({
        queryKey: ["roomTypes"],
        queryFn: RoomService.getAllRoomType,
    });

    const roomTypes = dataRoomType?.data || [];
    // console.log("roomTypes:", roomTypes);

    // Chuyển roomTypes thành object để dễ lookup
    const roomTypeMap = roomTypes.reduce((acc, type) => {
        acc[type._id] = type.TypeName;
        return acc;
    }, {});
    // console.log("roomTypes:", roomTypeMap);

    //create product
    const handleFinish = async () => {
        try {
            let hotelId = form.getFieldValue("hotel");
            if (!hotelId) {
                hotelId = stateRoom.hotel;
            }

            if (!hotelId || hotelId.length === 0) {
                api.error({ message: "Please select a hotel!" });
                return;
            }

            const roomName = stateRoom.roomName;
            setCurrentForm("single");

            const isRoomExist = existingRooms.some(
                (room) => room.RoomName === roomName
            );

            if (isRoomExist) {
                api.error({
                    message: "Room Already Exists!",
                    description: `The "${roomName}" name already exists`,
                });
                return;
            }

            const roomParams = {
                RoomName: roomName,
                Price: Number(stateRoom.price),
                roomtype: stateRoom.roomType,
                Floor: stateRoom.floor,
                hotel: stateRoom.hotel,
                Image: stateRoom.image,
                Description: stateRoom.description,
            };

            console.log("roomParams:", roomParams);
            const roomResponse = await mutationCreate.mutateAsync(roomParams);

            if (roomResponse?.status !== "OK") {
                api.error({
                    message: "Room Creation Failed",
                    description: roomResponse?.message || "An error occurred while creating the room.",
                });
                return;
            }

            const newRoomId = roomResponse?.data?._id;

            api.success({
                message: "Room Created Successfully",
                description: `Room "${roomName}" has been added.`,
            });

            // Xử lý amenities nếu có
            if (newRoomId && stateRoom.amenities?.length > 0) {
                const amenitiesParams = stateRoom.amenities.map((amenityId) => ({
                    room: newRoomId,
                    amenity: amenityId,
                    quantity: amenitiesQuantity[amenityId] || 1,
                    status: "Functioning",
                }));

                console.log("Sending Room Amenities:", amenitiesParams);

                await Promise.all(
                    amenitiesParams.map(async (params) => {
                        const roomAmenityResponse = await mutationCreateRoomAmenities.mutateAsync(params);

                        if (roomAmenityResponse?.status !== "OK") {
                            api.warning({
                                message: "Some Amenities Failed to Add",
                                description: `Amenity ID: ${params.amenity} could not be added.`,
                            });
                        }
                    })
                );

                api.success({
                    message: "Amenities Added Successfully",
                    description: `All selected amenities have been linked to Room "${roomName}".`,
                });
            } else {
                api.info({
                    message: "No Amenities Selected",
                    description: "Room was added, but no amenities were linked.",
                });
            }

            setRooms([]);
            form.resetFields();

            setTimeout(() => {
                navigate("/rooms/room-list");
            }, 3000);

        } catch (error) {
            console.error("Error in handleFinish:", error);
            api.error({
                message: "Process Failed",
                description: "An error occurred while creating the room and amenities.",
            });
        }
    };

    const handleQuantityChange = (amenityId, newQuantity) => {
        setAmenitiesQuantity((prev) => ({
            ...prev,
            [amenityId]: newQuantity,
        }));
    };

    //get all amenities
    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const res = await AmenityService.getAllAmenities();
                setAmenities(res.data);
                console.log("res amenities: ", res)
            } catch (error) {
                console.error("Failed to fetch amenities:", error);
            }
        };

        fetchAmenities();
    }, []);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setStateRoom((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOnChangeNumber = (name, value) => {
        setStateRoom((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOnChangeSelect = (name, value) => {
        setStateRoom((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = async ({ fileList }) => {
        if (fileList.length === 0) {
            setImageList([]);
            setStateRoom((prev) => ({ ...prev, image: "" }));
            return;
        }

        let file = fileList[fileList.length - 1];

        if (file.originFileObj) {
            file.preview = await getBase64(file.originFileObj);
        }

        setImageList([{ url: file.url || file.preview, alt: file.name || "Uploaded Image" }]);
        setStateRoom((prev) => ({ ...prev, image: file.preview }));
    };


    const handleDeleteRoom = (roomKey) => {
        setRooms((prevRooms) => prevRooms.filter(room => room.key !== roomKey));
        api.success({ message: "Room removed from the list." });
    };

    const handleConfirmSubmit = () => {
        setIsModalConfirm(false);
        handleSubmitBulk(); // Gọi hàm lưu tất cả rooms
    };

    const columns = [
        {
            title: "Image", dataIndex: "Image", key: "Image", width: "10%",
            render: (text) => (
                <img
                    src={text}
                    alt="Room Image"
                    style={{ width: 50, height: 30, objectFit: "cover", borderRadius: 4 }}
                />
            ),
        },
        { title: "Hotel", dataIndex: "Hotel", key: "Hotel", render: (hotelId) => hotelsMap[hotelId] || "N/A", },
        { title: "Room Name", dataIndex: "RoomName", key: "RoomName" },
        { title: "Price", dataIndex: "Price", key: "Price", render: (text) => convertPrice(text) },
        { title: "Room Type", dataIndex: "RoomType", key: "RoomType", render: (roomTypeId) => roomTypeMap[roomTypeId] || "N/A", },
        { title: "Floor", dataIndex: "Floor", key: "Floor" },
        {
            title: "Amenities",
            dataIndex: "roomAmenities",
            key: "Amenities",
            render: (roomAmenities) => {
                if (!roomAmenities || roomAmenities.length === 0) return 0;

                // Đếm số loại amenities duy nhất
                const uniqueAmenities = new Set(roomAmenities.map(item => item.amenityId));
                return uniqueAmenities.size;
            }
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button type="link" danger onClick={() => handleDeleteRoom(record.key)}>
                    Delete
                </Button>
            ),
        },
    ];

    const handleBulkAdd = () => {
        setCurrentForm("bulk");

        setTimeout(() => {
            let hotelId = formBulk.getFieldValue("hotel") || stateRoom.hotel;

            if (Array.isArray(hotelId)) {
                hotelId = hotelId.length > 0 ? hotelId[0] : null;
            }

            if (!hotelId) {
                api.error({ message: "Please select a hotel!" });
                return;
            }

            const roomName = formBulk.getFieldValue("roomName")?.trim();
            if (!roomName) {
                api.error({ message: "Room name is required!" });
                return;
            }

            const quantity = formBulk.getFieldValue("quantity") || 1;
            const selectedAmenities = [...new Set(formBulk.getFieldValue("amenities") || [])];

            const match = roomName.match(/^([A-Za-z]+)(\d+)$/);
            let prefix = roomName;
            let baseNumber = 1; // Mặc định số bắt đầu là 1

            if (match) {
                prefix = match[1];
                baseNumber = parseInt(match[2], 10);
                if (baseNumber < 10) {
                    baseNumber = `10${baseNumber}`;
                }
            }

            const roomsOnSameFloor = [...existingRooms, ...rooms].map(room => room.RoomName);
            let existingNumbers = roomsOnSameFloor
                .map(name => {
                    const match = name.match(new RegExp(`^${prefix}(\\d+)$`));
                    return match ? parseInt(match[1], 10) : null;
                })
                .filter(num => num !== null)
                .sort((a, b) => a - b);

            let newRooms = [];
            let usedNumbers = new Set(existingNumbers);
            let numberToUse = parseInt(baseNumber, 10);

            for (let i = 0; i < quantity; i++) {
                while (usedNumbers.has(numberToUse)) {
                    numberToUse++;
                }

                let newRoomName = `${prefix}${numberToUse}`;
                usedNumbers.add(numberToUse);

                let newRoom = {
                    key: newRoomName,
                    RoomName: newRoomName,
                    Price: formBulk.getFieldValue("Price"),
                    RoomType: formBulk.getFieldValue("roomtype"),
                    Floor: formBulk.getFieldValue("floor"),
                    Hotel: hotelId,  // 💡 Sử dụng `hotelId` đã kiểm tra
                    Description: formBulk.getFieldValue("description"),
                    Image: imageList.length > 0 ? imageList[0].url : "",
                    roomAmenities: selectedAmenities.map(amenityId => ({
                        amenityId,
                        quantity: amenitiesQuantity[amenityId] || 1,
                    })),
                };

                newRooms.push(newRoom);
                numberToUse++;
            }

            if (newRooms.length === 0) {
                api.error({ message: "No valid rooms to add!" });
                return;
            }

            console.log("🚀 New rooms added:", newRooms);
            setRooms(prevRooms => [...prevRooms, ...newRooms]);
            api.success({ message: `${newRooms.length} rooms added successfully!` });
        }, 500); // ⏳ Giảm delay xuống 500ms thay vì 1500ms
    };

    const handleSubmitBulk = async () => {
        if (rooms.length === 0) {
            api.error({ message: "No rooms added to submit!" });
            return;
        }

        try {
            const createdRooms = await Promise.all(
                rooms.map(async (room) => {
                    const roomParams = {
                        RoomName: room.RoomName,
                        Price: Number(room.Price),
                        roomtype: room.RoomType,
                        Floor: Number(room.Floor),
                        hotel: room.Hotel,
                        Image: room.Image || "",
                        Description: room.Description,
                    };
                    console.log("roomParams; ", roomParams)

                    const roomResponse = await mutationCreate.mutateAsync(roomParams);

                    if (roomResponse?.status !== "OK") {
                        console.error("❌ Room Creation Failed:", roomResponse);
                        return null;
                    }

                    return { ...room, _id: roomResponse?.data?._id };
                })
            );

            const validRooms = createdRooms.filter((room) => room && room._id);
            console.log("✅ Valid rooms:", validRooms);

            // 🛠 Dùng Set để loại bỏ trùng lặp
            const roomAmenitiesData = [];

            validRooms.forEach((room) => {
                const uniqueAmenities = new Set(); // Dùng Set để tránh trùng lặp

                room.roomAmenities.forEach((amenity) => {
                    if (!uniqueAmenities.has(`${room._id}-${amenity.amenityId}`)) {
                        uniqueAmenities.add(`${room._id}-${amenity.amenityId}`);

                        roomAmenitiesData.push({
                            room: room._id,
                            amenity: amenity.amenityId,
                            quantity: amenity.quantity,
                            status: "Functioning",
                        });
                    }
                });
            });

            console.log("🏠 Final roomAmenitiesData before API:", roomAmenitiesData);

            if (roomAmenitiesData.length > 0) {
                await Promise.all(roomAmenitiesData.map((params) => mutationCreateRoomAmenities.mutateAsync(params)));
            }

            api.success({
                message: "🎉 Bulk Rooms Added Successfully!",
                description: `${validRooms.length} rooms have been created along with their amenities.`,
            });

            setRooms([]);
            formBulk.resetFields();

            setTimeout(() => {
                navigate("/rooms/room-list");
            }, 3000);

        } catch (error) {
            console.error("❌ Error creating multiple rooms:", error);
            api.error({ message: "⚠ Failed to add multiple rooms!" });
        }
    };


    return (
        <>
            {contextHolder}
            <Row gutter={24}>
                <Col span={7}>
                    <Form.Item label="Hotel" name="hotel" rules={[{ required: true, message: "Please select hotel" }]}>
                        <Select value={stateRoom.hotel}
                            onChange={(value) => {
                                handleOnChangeSelect("hotel", value);

                                if (currentForm === "bulk") {
                                    formBulk.setFieldsValue({ hotel: value });
                                } else {
                                    form.setFieldsValue({ hotel: value });
                                }
                            }}
                            placeholder="Select Hotel"
                        >
                            {hotels?.map((h) => (
                                <Option key={h._id} value={h._id}>{h.NameHotel}</Option>
                            ))}
                        </Select>
                        {/* {mutationCreate.data?.status === "ERR" && (
                            <span style={{ color: "red" }}>*{mutationCreate.data?.message}</span>
                        )} */}
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <StyledRadioGroup value={mode} onChange={(e) => setMode(e.target.value)}>
                        <StyledRadioButton value="single" selected={mode === "single"}>
                            Add a Room
                        </StyledRadioButton>
                        <StyledRadioButton value="bulk" selected={mode === "bulk"}>
                            Add Multiple Rooms
                        </StyledRadioButton>
                    </StyledRadioGroup>
                </Col>
            </Row>


            {/* ADD SINGLE ROOM */}
            {mode === "single" && (
                <RoomFormContainer>
                    <Row gutter={24}>
                        <Col span={7}>
                            <ImageUploadSection>
                                <MainImagePreview>
                                    {imageList.length > 0 && imageList[0].url ? (
                                        <MainImagePreviewImg src={imageList[0].url} alt="Upload Image" />
                                    ) : (
                                        <UploadOutlined className="placeholder-icon" />
                                    )}
                                </MainImagePreview>
                                <Upload listType="picture-card" fileList={imageList} onChange={handleImageChange} maxCount={1} >
                                    {imageList.length === 0 && (
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
                            </ImageUploadSection>
                        </Col>

                        <Col span={17}>
                            <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleFinish} >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Room Name" name="roomName" rules={[{ required: true, message: "Please enter room name" }]}>
                                            <Input value={stateRoom.roomName} name="roomName" onChange={handleOnChange} placeholder="Enter room name" />
                                            {/* {mutationCreate.data?.status === "ERR" && (
                                                <span style={{ color: "red" }}>*{mutationCreate.data?.message}</span>
                                            )} */}
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item style={{ width: "30%" }} label="Room Floor" name="floor" rules={[{ required: true, message: "Please enter floor" }]}>
                                            <InputNumber value={stateRoom.floor} onChange={(value) => handleOnChangeNumber("floor", value)} style={{ width: "100%" }} min={0} placeholder="Value" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Room Price" name="Price" rules={[{ required: true, message: "Please enter room price" }]}>
                                            <InputNumber value={stateRoom.price} name="Price" onChange={(value) => handleOnChangeNumber("price", value)} style={{ width: "100%" }} min={1} placeholder="Value" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Room Type" name="roomtype" rules={[{ required: true, message: "Please select room type" }]}>
                                            <Select value={stateRoom.roomType} onChange={(value) => handleOnChangeSelect("roomType", value)} placeholder="Select Room Type">
                                                {roomTypes?.map((type) => (
                                                    <Option key={type._id} value={type._id}>{type.TypeName}</Option> // Lưu _id vào state
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16} style={{ backgroundColor: "#EEEEEE", borderRadius: 8 }}>
                                    <Col span={4}>
                                        <Form.Item label="Quantity Amenities">
                                            <Space>
                                                <Button
                                                    icon={<MinusOutlined />}
                                                    disabled={!selectedAmenityId || (amenitiesQuantity[selectedAmenityId] || 1) <= 1}
                                                    onClick={() => {
                                                        if (!selectedAmenityId) return;
                                                        const newValue = Math.max(1, (amenitiesQuantity[selectedAmenityId] || 1) - 1);
                                                        handleQuantityChange(selectedAmenityId, newValue);
                                                    }}
                                                />
                                                <Input
                                                    min={1}
                                                    max={100}
                                                    value={selectedAmenityId ? amenitiesQuantity[selectedAmenityId] || 1 : ""}
                                                    style={{ width: 40, textAlign: "center" }}
                                                    onChange={(e) => {
                                                        if (!selectedAmenityId) return;
                                                        const newValue = Number(e.target.value) || 1;
                                                        handleQuantityChange(selectedAmenityId, newValue);
                                                    }}
                                                />
                                                <Button
                                                    icon={<PlusOutlined />}
                                                    onClick={() => {
                                                        if (!selectedAmenityId) return;
                                                        const newValue = Math.min(100, (amenitiesQuantity[selectedAmenityId] || 1) + 1);
                                                        handleQuantityChange(selectedAmenityId, newValue);
                                                    }}
                                                />
                                            </Space>
                                        </Form.Item>

                                    </Col>
                                    <Col span={20}>
                                        <Form.Item
                                            label="Room Amenities"
                                            name="amenities"
                                            rules={[{ required: true, message: "Please select room amenities" }]}
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="Select amenities"
                                                value={stateRoom.amenities}
                                                onChange={(selectedValues) => {
                                                    setStateRoom({ ...stateRoom, amenities: selectedValues });

                                                    // Gán số lượng mặc định là 1 nếu amenity chưa có số lượng
                                                    setAmenitiesQuantity((prev) => {
                                                        const updatedQuantities = { ...prev };
                                                        selectedValues.forEach((amenityId) => {
                                                            if (!updatedQuantities[amenityId]) {
                                                                updatedQuantities[amenityId] = 1;
                                                            }
                                                        });
                                                        return updatedQuantities;
                                                    });

                                                    // Cập nhật `selectedAmenityId` là tiện ích cuối cùng được chọn
                                                    setSelectedAmenityId(selectedValues[selectedValues.length - 1] || null);
                                                }}
                                            >
                                                {amenities?.map((amenity) => {
                                                    const quantity = amenitiesQuantity[amenity._id] || 1;
                                                    return (
                                                        <Option key={amenity._id} value={amenity._id}>
                                                            {`${amenity.AmenitiesName} (${quantity})`}
                                                        </Option>
                                                    );
                                                })}
                                            </Select>
                                        </Form.Item>

                                    </Col>
                                </Row>

                                <Form.Item label="Room Description" name="description">
                                    <Input.TextArea value={stateRoom.description} name="description" onChange={handleOnChange} rows={3} placeholder="Enter room description" />
                                </Form.Item>
                                {/* <SubmitBtn type="submit">Save Room</SubmitBtn> */}
                                <Form.Item>
                                    <Button style={{ backgroundColor: "rgb(121, 215, 190)", borderColor: "rgb(121, 215, 190)", color: "black" }} htmlType="submit">
                                        Save Room
                                    </Button>

                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </RoomFormContainer>
            )}
            {/* ADD MULTIPLE ROOMS */}
            {mode === "bulk" && (
                <RoomFormContainer>
                    <Row gutter={24}>
                        <Col span={7}>
                            <ImageUploadSection>
                                <MainImagePreview>
                                    {imageList.length > 0 && imageList[0].url ? (
                                        <MainImagePreviewImg
                                            src={imageList[0].url}
                                            alt="Upload Image"
                                        />
                                    ) : (
                                        <UploadOutlined className="placeholder-icon" />
                                    )}
                                </MainImagePreview>
                                <Upload listType="picture-card" fileList={imageList} onChange={handleImageChange} maxCount={1}>
                                    {imageList.length === 0 && (
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
                            </ImageUploadSection>
                        </Col>
                        <Col span={17}>
                            <Form form={formBulk} layout="vertical" initialValues={initialValues} onFinish={handleSubmitBulk} >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        {/* <Form.Item label="Room Name" name="roomName" rules={[{ required: true, message: "Please enter room name" }]}>
                                            <Input value={stateRoom.roomName} name="roomName" onChange={handleOnChange} placeholder="Enter room name (e.g., R1, B2, D3)" />
                                        </Form.Item> */}
                                        <Form.Item
                                            label={
                                                <span style={{ fontWeight: 600, color: "#1890ff" }}>
                                                    Room Name
                                                    <Tooltip title="Enter a room code in the format: Letter + Number (e.g., R1, B2, D3)">
                                                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                                                    </Tooltip>
                                                </span>
                                            }
                                            name="roomName"
                                            rules={[{ required: true, message: "Please enter room name" }]}
                                        >
                                            <Input
                                                value={stateRoom.roomName}
                                                name="roomName"
                                                onChange={handleOnChange}
                                                placeholder="Enter room code (e.g., R1, B2, D3)"

                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item style={{ width: "30%" }} label="Room Floor" name="floor" rules={[{ required: true, message: "Please enter floor" }]}>
                                            <InputNumber value={stateRoom.floor} name="floor" onChange={(value) => handleOnChangeNumber("floor", value)} style={{ width: "100%" }} min={0} placeholder="Value" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Form.Item label="Room Price" name="Price" rules={[{ required: true, message: "Please enter room price" }]}>
                                            <InputNumber value={stateRoom.price} name="Price" onChange={(value) => handleOnChangeNumber("price", value)} style={{ width: "100%" }} min={1} placeholder="Value" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        {mode === "bulk" && (
                                            <Form.Item label="Rooms to Queue" name="quantity" rules={[{ required: true, message: "Please enter quantity" }]}>
                                                <InputNumber style={{ width: "100%" }} min={1} name="quantity" value={quantity} onChange={setQuantity} placeholder="Value" />
                                            </Form.Item>
                                        )}
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Room Type" name="roomtype" rules={[{ required: true, message: "Please select room type" }]}>
                                            <Select name="roomtype" value={stateRoom.roomType} onChange={(value) => handleOnChangeSelect("roomType", value)} placeholder="Select Room Type">
                                                {roomTypes?.map((type) => (
                                                    <Option key={type._id} value={type._id}>{type.TypeName}</Option> // Lưu _id vào state
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16} style={{ backgroundColor: "#EEEEEE", borderRadius: 8 }}>
                                    <Col span={4}>
                                        <Form.Item label="Quantity Amenities">
                                            <Space>
                                                <Button
                                                    icon={<MinusOutlined />}
                                                    disabled={!selectedAmenityId || (amenitiesQuantity[selectedAmenityId] || 1) <= 1}
                                                    onClick={() => {
                                                        if (!selectedAmenityId) return;
                                                        const newValue = Math.max(1, (amenitiesQuantity[selectedAmenityId] || 1) - 1);
                                                        handleQuantityChange(selectedAmenityId, newValue);
                                                    }}
                                                />
                                                <Input
                                                    min={1}
                                                    max={100}
                                                    value={selectedAmenityId ? amenitiesQuantity[selectedAmenityId] || 1 : ""}
                                                    style={{ width: 40, textAlign: "center" }}
                                                    onChange={(e) => {
                                                        if (!selectedAmenityId) return;
                                                        const newValue = Number(e.target.value) || 1;
                                                        handleQuantityChange(selectedAmenityId, newValue);
                                                    }}
                                                />
                                                <Button
                                                    icon={<PlusOutlined />}
                                                    onClick={() => {
                                                        if (!selectedAmenityId) return;
                                                        const newValue = Math.min(100, (amenitiesQuantity[selectedAmenityId] || 1) + 1);
                                                        handleQuantityChange(selectedAmenityId, newValue);
                                                    }}
                                                />
                                            </Space>
                                        </Form.Item>

                                    </Col>
                                    <Col span={20}>
                                        <Form.Item
                                            label="Room Amenities"
                                            name="amenities"
                                            rules={[{ required: true, message: "Please select room amenities" }]}
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="Select amenities"
                                                value={stateRoom.amenities}
                                                onChange={(selectedValues) => {
                                                    setStateRoom({ ...stateRoom, amenities: selectedValues });

                                                    // Gán số lượng mặc định là 1 nếu amenity chưa có số lượng
                                                    setAmenitiesQuantity((prev) => {
                                                        const updatedQuantities = { ...prev };
                                                        selectedValues.forEach((amenityId) => {
                                                            if (!updatedQuantities[amenityId]) {
                                                                updatedQuantities[amenityId] = 1;
                                                            }
                                                        });
                                                        return updatedQuantities;
                                                    });

                                                    // Cập nhật `selectedAmenityId` là tiện ích cuối cùng được chọn
                                                    setSelectedAmenityId(selectedValues[selectedValues.length - 1] || null);
                                                }}
                                            >
                                                {amenities?.map((amenity) => {
                                                    const quantity = amenitiesQuantity[amenity._id] || 1;
                                                    return (
                                                        <Option key={amenity._id} value={amenity._id}>
                                                            {`${amenity.AmenitiesName} (${quantity})`}
                                                        </Option>
                                                    );
                                                })}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item label="Room Description" name="description">
                                    <Input.TextArea value={stateRoom.description} name="description" onChange={handleOnChange} rows={3} placeholder="Enter room description" />
                                </Form.Item>

                                <Button
                                    style={{ backgroundColor: "rgb(121, 215, 190)", borderColor: "rgb(121, 215, 190)", color: "black" }}
                                    onClick={async () => {
                                        try {
                                            await formBulk.validateFields(); // Đợi validate xong
                                            handleBulkAdd(); // Nếu hợp lệ, tiếp tục thêm vào hàng đợi
                                        } catch (error) {
                                            console.log("Validation failed:", error);
                                        }
                                    }}>Queue Room (Not Saved Yet)
                                </Button>
                            </Form>
                        </Col>
                    </Row>
                    <p></p>

                    <Table dataSource={rooms} columns={columns} pagination={false} style={{ marginTop: 20 }} />

                    <ModalComponent
                        title="Confirm saving rooms"
                        open={isModalConfirm}
                        onOk={handleConfirmSubmit}
                        onCancel={() => setIsModalConfirm(false)}
                    >
                        <div>Are you sure you want to save all rooms?</div>
                    </ModalComponent>

                    <Button
                        type="primary"
                        style={{ marginTop: 20, backgroundColor: "rgb(121, 215, 190)", borderColor: "rgb(121, 215, 190)", color: "black" }}
                        onClick={() => setIsModalConfirm(true)}
                    >
                        Add All Rooms
                    </Button>

                </RoomFormContainer>
            )}

        </>

    );
};

export default AddRoomForm;
