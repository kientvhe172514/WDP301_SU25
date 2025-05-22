import React, { useEffect, useRef, useState } from "react";
import {
    DeleteOutlined, EditOutlined, MinusOutlined, PlusOutlined, SearchOutlined, UploadOutlined, ToolOutlined
} from "@ant-design/icons";
import { Form, Input, InputNumber, Select, Button, Upload, Row, Col, Space, Table, notification, Spin } from "antd";
import * as RoomService from "../../services/RoomService";
import * as HotelService from "../../services/HotelService";
import * as AmenityService from "../../services/AmenityService";
import * as RoomAmenityService from "../../services/RoomAmenitiesService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import { ImageUploadSection, MainImagePreview, MainImagePreviewImg, UploadWrapper, } from "./AddRoomStyle";
import { convertPrice, getBase64 } from "../../utils";

const { Option } = Select;

const RoomList = () => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);
    const [form] = Form.useForm();
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isModalDelete, setIsModalDelete] = useState(false);
    const [rowSelected, setRowSelected] = useState("");
    const navigate = useNavigate();
    const [amenities, setAmenities] = useState([]);
    const [selectedAmenityId, setSelectedAmenityId] = useState(null);
    const [amenitiesQuantity, setAmenitiesQuantity] = useState({});
    const [api, contextHolder] = notification.useNotification();
    const [stateAmenitiesRoom, setStateAmenitiesRoom] = useState([]);
    const [isAmenitiesDrawerOpen, setIsAmenitiesDrawerOpen] = useState(false);
    const [amenitiesForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(selectedKeys, confirm, dataIndex)
                    }
                    style={{
                        marginBottom: 8,
                        display: "block",
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters)
                        }
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? "#1677ff" : undefined,
                }}
            />
        ),
        onFilter: (value, record) => {
            const fieldValue = dataIndex
                .split(".") // Tách trường thành mảng ["hotel", "NameHotel"]
                .reduce((obj, key) => (obj ? obj[key] : undefined), record); // Lấy giá trị thực tế

            return fieldValue ? fieldValue.toString().toLowerCase().includes(value.toLowerCase()) : false;
        },
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        // render: (text) =>
        //     searchedColumn === dataIndex ? (
        //         <Highlighter
        //             highlightStyle={{
        //                 backgroundColor: "#ffc069",
        //                 padding: 0,
        //             }}
        //             searchWords={[searchText]}
        //             autoEscape
        //             textToHighlight={text ? text.toString() : ""}
        //         />
        //     ) : (
        //         text
        //     ),
    });

    const handleDetailsRoom = () => {
        if (rowSelected) {
            fetchGetDetailsRoom(rowSelected)
        }
        console.log("rowSelected: ", rowSelected);
        // setRowSelected(record);
        setIsOpenDrawer(true);
    };

    const renderAction = () => {
        return (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <DeleteOutlined
                    style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
                    onClick={() => setIsModalDelete(true)}
                />
                <EditOutlined
                    style={{ color: "orange", fontSize: "20px", cursor: "pointer" }}
                    onClick={handleDetailsRoom}
                />
                <ToolOutlined
                    style={{ color: "blue", fontSize: "20px", cursor: "pointer" }}
                    onClick={() => handleEditAmenities(rowSelected)}
                />
            </div>
        );
    };
    const columns = [
        {
            title: "Image",
            dataIndex: "Image",
            key: "image",
            width: "8%",
            render: (Image) =>
                Image ? (
                    <img
                        src={Image}
                        alt="Hotel"
                        style={{ width: "80%", height: 35, objectFit: "cover", borderRadius: 6 }}
                    />
                ) : (
                    "No Image"
                ),
        },
        {
            title: "Hotel Name",
            dataIndex: "hotel",
            key: "hotel",
            width: "15%",
            ...getColumnSearchProps("hotel.NameHotel"),
            sorter: (a, b) => (a.hotel?.NameHotel.length || 0) - b.hotel?.NameHotel.length,
            render: (hotel) => hotel?.NameHotel || "No hotel"
        },
        {
            title: "Room Name",
            dataIndex: "RoomName",
            key: "roomName",
            width: "12%",
            ...getColumnSearchProps("roomName"),
            sorter: (a, b) => {
                const extractNumber = (roomName) => {
                    const match = roomName.match(/^([A-Za-z]+)(\d+)$/);
                    return match ? parseInt(match[2], 10) : 0; // Trả về số nếu có, nếu không thì 0
                };

                return extractNumber(a.RoomName) - extractNumber(b.RoomName);
            },
            sortDirections: ["descend", "ascend"],
        },
        {
            title: "Price",
            dataIndex: "Price",
            key: "price",
            width: "10%",
            render: (Price) => convertPrice(Price),
            ...getColumnSearchProps("Price"),
            sorter: (a, b) => a.Price - b.Price,
            sortDirections: ["descend", "ascend"],
        },
        {
            title: "Status",
            dataIndex: "Status",
            key: "status",
            width: "12%",
        },
        {
            title: "Type Rooms",
            dataIndex: "roomtype",
            width: "15%",
            key: "roomtype",
            ...getColumnSearchProps("roomtype"),
            sorter: (a, b) => a.roomtype?.TypeName.length - b.roomtype?.TypeName.length,
            render: (roomtype) => roomtype?.TypeName || "No type"
        },
        {
            title: "Floor",
            dataIndex: "Floor",
            key: "floor",
            width: "7%",
        },
        {
            title: "Actions",
            key: "actions",
            width: "10%",
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
                        onClick={() => {
                            setRowSelected(record._id);
                            handleDetailsRoom();
                        }}
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
                        onClick={() => {
                            setRowSelected(record._id);
                            setIsModalDelete(true);
                        }}
                    />
                </Space>
            ),
        },
        {
            title: "Room Amenities",
            key: "amenities",
            width: "12%",
            render: (_, record) => (
                <Button
                    icon={<ToolOutlined />}
                    onClick={() => handleEditAmenities(record._id)}
                    type="primary"
                    ghost
                    style={{
                        backgroundColor: "#e6f4ff",
                        borderColor: "#1890ff"
                    }}
                >
                    Edit Amenities
                </Button>
            ),
        },
    ];

    const [stateRoom, setStateRoom] = useState({
        RoomName: "", Price: "", roomtype: "", Floor: "", Image: "", Description: "", Status: "", hotel: ""
    });

    // const [stateAmenitiesRoom, setStateAmenitiesRoom] = useState({
    //     room: "", amenity: "", quantity: "", status: ""
    // });

    const mutationUpdate = useMutation({
        mutationFn: async ({ id, data }) => {
            return await RoomService.updateRoom(id, data);
        },
    });

    const mutationDelete = useMutation({
        mutationFn: async ({ id }) => {
            return await RoomService.deleteRoom(id);
        },
    });

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

    //✅ Lấy danh sách Room Types
    const { data: dataRoomTypes } = useQuery({
        queryKey: ["roomTypes"],
        queryFn: RoomService.getAllRoomType,
    });
    const roomTypes = dataRoomTypes?.data || [];

    // ✅ Lấy danh sách Hotels
    const { data: dataHotels } = useQuery({
        queryKey: ["hotels"],
        queryFn: HotelService.getAllHotel,
    });
    const hotels = dataHotels?.data || [];

    //✅ Lấy danh sách Rooms
    const getAllRooms = async () => {
        setLoading(true); // Bật loading
        try {
            const res = await RoomService.getAllRoom();
            return res;
        } finally {
            setLoading(false); // Tắt loading khi xong
        }
    };
    const queryRoom = useQuery({
        queryKey: ["rooms"],
        queryFn: getAllRooms,
    });

    const { isLoading: isLoadingRoom, data: rooms = [] } = queryRoom;
    // const { isLoading: isLoadingUpdate, data: dataUpdate } = mutationUpdate;

    const dataTable =
        rooms?.data?.length &&
        rooms?.data?.map((p) => {
            return { ...p, key: p._id };
        });
    // console.log("dataTable", dataTable);

    // Hàm giúp chuyển đổi dữ liệu API thành format hợp lệ
    const mapRoomData = (data) => ({
        _id: data._id,
        RoomName: data.RoomName || "",
        Price: data.Price || "",
        Floor: data.Floor || "",
        Description: data.Description || "",
        Image: data.Image || "",
        hotel: data.hotel || "",
        roomtype: data.roomtype || "",
    });
    console.log("stateAmenities", stateAmenitiesRoom);
    //fetch room amenities by room id
    const fetchGetRoomAmenities = async (roomId) => {
        console.log('Fetching amenities for room:', roomId); // Debug log
        try {
            const response = await RoomAmenityService.getAmenitiesByRoomId(roomId);
            console.log('Raw API response:', response); // Debug log
            return response;
        } catch (error) {
            console.error('Error in fetchGetRoomAmenities:', error);
            throw error;
        }
    };


    // Xử lý form update room

    //Hàm lấy chi tiết Room
    const fetchGetDetailsRoom = async (roomId) => {
        if (!roomId) return;
        try {
            const res = await RoomService.getRoomById(roomId);
            if (res?.data) {
                // console.log("Room Data from API:", res.data.Image); // Debug API response
                setStateRoom(mapRoomData(res.data));
            }
        } catch (error) {
            console.error("Failed to fetch Room details:", error);
        }
    };


    //Tự động lấy chi tiết phòng khi chọn
    useEffect(() => {
        if (rowSelected) {
            fetchGetDetailsRoom(rowSelected)
            fetchGetRoomAmenities(rowSelected)
        }
    }, [rowSelected]);

    // Chỉ cập nhật khi có dữ liệu
    useEffect(() => {
        if (stateRoom._id) {
            // console.log("Updated stateRoom:", stateRoom);
            form.setFieldsValue({
                RoomName: stateRoom.RoomName,
                Price: stateRoom.Price,
                Floor: stateRoom.Floor,
                Description: stateRoom.Description,
                Image: stateRoom.Image,
                hotel: stateRoom.hotel,
                roomtype: stateRoom.roomtype,
            });
        }
    }, [stateRoom, form]);

    const handleOnChange = (value, field) => {
        // Nếu là Select (Hotel hoặc RoomType) thì chỉ lưu ObjectId (_id)
        if (field === "hotel" || field === "roomtype") {
            setStateRoom((prev) => ({
                ...prev,
                [field]: value, // Chỉ lưu ObjectId thay vì { value, label }
            }));
        } else {
            setStateRoom((prev) => ({
                ...prev,
                [field]: value, // Lưu giá trị bình thường
            }));
        }
    };

    //get image product details
    const handleOnChangeImageDetails = async ({ fileList }) => {
        const file = fileList[0];
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setStateRoom({
            ...stateRoom,
            Image: file.preview,
        });
    };

    const handleQuantityChange = (amenityId, newQuantity) => {
        setAmenitiesQuantity((prev) => ({
            ...prev,
            [amenityId]: newQuantity,
        }));
    };

    //Hàm cập nhật Room
    const onUpdateHotel = () => {
        const updateData = {
            RoomName: stateRoom.RoomName,
            Price: stateRoom.Price,
            Floor: stateRoom.Floor,
            Description: stateRoom.Description,
            Image: stateRoom.Image,
            roomtype: stateRoom.roomtype || "",
            hotel: stateRoom.hotel || "",
        };

        console.log("onUpdateHotel", updateData);
        mutationUpdate.mutate(
            { id: rowSelected, data: updateData },
            {
                onSuccess: () => {
                    api.success({ message: "Room updated successfully!" });
                    setIsOpenDrawer(false);
                    fetchGetDetailsRoom(rowSelected);
                },
                onError: (error) => {
                    console.error("Update Room Error:", error);
                    api.error({ message: "Failed to update room!" });
                },
                onSettled: () => {
                    queryRoom.refetch();
                }
            }
        );
    };

    //delete room
    const handleCancelDelete = () => {
        setIsModalDelete(false);
        // console.log("handleDeteleProduct", rowSelected);
    };

    //delete product
    const handleDeleteRoom = () => {
        mutationDelete.mutate(
            { id: rowSelected },
            {
                onSuccess: (response) => {
                    console.log("API Response:", response);
                    api.success({ message: "Room delete successfully!" });
                    setIsModalDelete(false);
                    fetchGetDetailsRoom(rowSelected);
                },
                onSettled: (error) => {
                    console.error("Update Room Error:", error);
                    setIsModalDelete(false);
                    queryRoom.refetch();
                },
            }
        );
    };

    const handleEditAmenities = async (roomId) => {
        if (!roomId) return;
        console.log('Editing amenities for room:', roomId);
        setRowSelected(roomId);
        // Clear previous selections
        setStateAmenitiesRoom([]);
        setAmenitiesQuantity({});
        setSelectedAmenityId(null);

        try {
            const response = await fetchGetRoomAmenities(roomId);
            console.log('Fetched room amenities response:', response);
            if (response?.data) {
                setStateAmenitiesRoom(response.data);
                // Initialize quantities for existing amenities
                const quantities = {};
                response.data.forEach(amenity => {
                    quantities[amenity._id] = amenity.quantity;
                });
                setAmenitiesQuantity(quantities);
            }
            setIsAmenitiesDrawerOpen(true);
        } catch (error) {
            console.error('Error fetching room amenities:', error);
            api.error({
                message: "Error",
                description: "Failed to fetch room amenities"
            });
        }
    };

    const handleUpdateAmenities = async () => {
        try {
            const updatedAmenities = stateAmenitiesRoom.map(amenity => ({
                amenityId: amenity._id,
                quantity: amenitiesQuantity[amenity._id] || 1,
                status: amenity.status || "Functioning"
            }));

            // Call your API to update amenities
            const response = await RoomAmenityService.updateRoomAmenities(rowSelected, updatedAmenities);

            if (response.status === "OK") {
                api.success({
                    message: "Success",
                    description: "Room amenities updated successfully",
                });
                setIsAmenitiesDrawerOpen(false);
                fetchGetRoomAmenities(rowSelected);
            } else {
                api.error({
                    message: "Error",
                    description: "Failed to update room amenities",
                });
            }
        } catch (error) {
            api.error({
                message: "Error",
                description: "An error occurred while updating room amenities",
            });
        }
    };

    return (
        <>
            {contextHolder}
            <Button
                style={{
                    height: "90px", width: "90px", borderRadius: "6px", borderStyle: "dashed",
                    marginBottom: "15px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}
                onClick={() => navigate('/rooms')}
            >
                <PlusOutlined style={{ fontSize: "35px" }} />
                <div style={{ fontSize: "13px", fontWeight: "500" }}>
                    Add Room
                </div>
            </Button>

            <Spin spinning={loading}>
                <Table columns={columns} dataSource={dataTable}
                    loading={isLoadingRoom}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: (event) => {
                                console.log("Record Selected:", record);
                                setRowSelected(record._id);
                            }
                        };
                    }}
                />
            </Spin>

            <DrawerComponent
                title="Update Room"
                isOpen={isOpenDrawer}
                onClose={() => setIsOpenDrawer(false)}
                width="80%"
            >
                <Form form={form} layout="vertical" onFinish={onUpdateHotel} autoComplete="on">
                    <Form.Item label="Hotel" name="hotel" rules={[{ required: true, message: "Please select hotel" }]}>
                        <Select style={{ width: "28%" }}
                            placeholder="Select Hotel"
                            onChange={(value) => handleOnChange(value, "hotel")}
                            value={stateRoom.hotel}
                        >
                            {hotels.map((hotel) => (
                                <Option key={hotel._id} value={hotel._id}>
                                    {hotel.NameHotel}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={24}>
                        <Col span={7}>
                            <ImageUploadSection>
                                {/* Hiển thị ảnh đã chọn */}
                                <MainImagePreview>
                                    {stateRoom?.Image ? (
                                        <MainImagePreviewImg src={stateRoom?.Image} alt="Uploaded Image" />
                                    ) : (
                                        <UploadOutlined className="placeholder-icon" />
                                    )}
                                </MainImagePreview>

                                {/* Upload chỉ hiện icon */}
                                <UploadWrapper>
                                    <Upload
                                        listType="picture-card"
                                        maxCount={1}
                                        showUploadList={false} // Ẩn danh sách ảnh
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

                        <Col span={16} style={{ marginLeft: "20px" }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Room Name" name="RoomName" rules={[{ required: true, message: "Please enter room name" }]}>
                                        <Input name="roomName" placeholder="Enter room name"
                                            value={stateRoom.RoomName} onChange={(e) => handleOnChange(e.target.value, "RoomName")}
                                        />

                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item style={{ width: "30%" }} label="Room Floor" name="Floor" rules={[{ required: true, message: "Please enter floor" }]}>
                                        <InputNumber style={{ width: "100%" }} min={0} placeholder="Value"
                                            value={stateRoom.Floor} onChange={(value) => handleOnChange(value, "Floor")}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Room Price" name="Price" rules={[{ required: true, message: "Please enter room price" }]}>
                                        <InputNumber style={{ width: "100%" }} min={1} placeholder="Value"
                                            value={stateRoom.Price} name="Price" onChange={(value) => handleOnChange(value, "Price")}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Room Type" name="roomtype" rules={[{ required: true, message: "Please select room type" }]}>
                                        <Select
                                            placeholder="Select Room Type"
                                            onChange={(value) => handleOnChange(value, "roomtype")}
                                            value={stateRoom.roomtype}
                                        >
                                            {roomTypes.map((type) => (
                                                <Option key={type._id} value={type._id}>
                                                    {type.TypeName}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Room Description" name="Description">
                                <Input.TextArea name="Description" rows={3} placeholder="Enter room description"
                                    value={stateRoom.Description} onChange={handleOnChange}
                                />
                            </Form.Item>
                            {/* <SubmitBtn type="submit">Save Room</SubmitBtn> */}
                            <Form.Item>
                                <Button style={{ backgroundColor: "rgb(121, 215, 190)", borderColor: "rgb(121, 215, 190)", color: "black" }} htmlType="submit">
                                    Update Room
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </DrawerComponent>

            <DrawerComponent
                title="Edit Room Amenities"
                isOpen={isAmenitiesDrawerOpen}
                onClose={() => {
                    setIsAmenitiesDrawerOpen(false);
                    // Clear selections when closing
                    setStateAmenitiesRoom([]);
                    setAmenitiesQuantity({});
                    setSelectedAmenityId(null);
                }}
                width="600px"
            >
                <div style={{ backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "8px" }}>
                    <Form form={amenitiesForm} layout="vertical">
                        <div style={{ marginBottom: 16 }}>
                            <h3>Current Room Amenities</h3>
                            <Table
                                dataSource={stateAmenitiesRoom}
                                columns={[
                                    {
                                        title: "Amenity",
                                        dataIndex: "AmenitiesName",
                                        key: "AmenitiesName",
                                    },
                                    {
                                        title: "Quantity",
                                        key: "quantity",
                                        render: (_, record) => (
                                            <Space>
                                                <Button
                                                    icon={<MinusOutlined />}
                                                    onClick={() => {
                                                        const currentQty = amenitiesQuantity[record._id] || 1;
                                                        if (currentQty > 1) {
                                                            handleQuantityChange(record._id, currentQty - 1);
                                                        }
                                                    }}
                                                />
                                                <InputNumber
                                                    min={1}
                                                    value={amenitiesQuantity[record._id] || 1}
                                                    onChange={(value) => handleQuantityChange(record._id, value)}
                                                    style={{ width: 60 }}
                                                />
                                                <Button
                                                    icon={<PlusOutlined />}
                                                    onClick={() => {
                                                        const currentQty = amenitiesQuantity[record._id] || 1;
                                                        handleQuantityChange(record._id, currentQty + 1);
                                                    }}
                                                />
                                            </Space>
                                        ),
                                    },
                                    {
                                        title: "Status",
                                        key: "status",
                                        render: (_, record) => (
                                            <Select
                                                value={record.status || "Functioning"}
                                                style={{ width: 120 }}
                                                onChange={(value) => {
                                                    const updatedAmenities = stateAmenitiesRoom.map(amenity =>
                                                        amenity._id === record._id ? { ...amenity, status: value } : amenity
                                                    );
                                                    setStateAmenitiesRoom(updatedAmenities);
                                                }}
                                            >
                                                <Select.Option value="Functioning">Functioning</Select.Option>
                                                <Select.Option value="Broken">Broken</Select.Option>
                                                <Select.Option value="Missing">Missing</Select.Option>
                                                <Select.Option value="Other">Other</Select.Option>
                                            </Select>
                                        ),
                                    },
                                ]}
                                pagination={false}
                            />
                        </div>

                        <div style={{
                            marginTop: 16,
                            backgroundColor: "#fff",
                            padding: "15px",
                            borderRadius: "6px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}>
                            <h3>Add New Amenities</h3>
                            <Select
                                mode="multiple"
                                style={{ width: '100%' }}
                                placeholder="Select amenities to add"
                                value={[]} // Always empty to prevent selection persistence
                                onChange={(selectedValues) => {
                                    const newAmenities = amenities
                                        .filter(a => selectedValues.includes(a._id))
                                        .filter(a => !stateAmenitiesRoom.some(existing => existing._id === a._id))
                                        .map(a => ({
                                            ...a,
                                            status: "Functioning"
                                        }));

                                    setStateAmenitiesRoom([...stateAmenitiesRoom, ...newAmenities]);
                                }}
                            >
                                {amenities
                                    .filter(a => !stateAmenitiesRoom.some(existing => existing._id === a._id))
                                    .map(amenity => (
                                        <Select.Option key={amenity._id} value={amenity._id}>
                                            {amenity.AmenitiesName}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </div>

                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <Space>
                                <Button onClick={() => {
                                    setIsAmenitiesDrawerOpen(false);
                                    // Clear selections when canceling
                                    setStateAmenitiesRoom([]);
                                    setAmenitiesQuantity({});
                                    setSelectedAmenityId(null);
                                }}>
                                    Cancel
                                </Button>
                                <Button type="primary" onClick={handleUpdateAmenities}>
                                    Save Changes
                                </Button>
                            </Space>
                        </div>
                    </Form>
                </div>
            </DrawerComponent>

            <ModalComponent
                title="Delete Room"
                open={isModalDelete}
                onOk={handleDeleteRoom}
                onCancel={handleCancelDelete}
            >
                <div>Are you sure you want to delete this room?</div>
            </ModalComponent>
        </>
    );
};

export default RoomList;
