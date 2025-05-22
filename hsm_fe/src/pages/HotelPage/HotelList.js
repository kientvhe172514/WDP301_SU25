import React, { useEffect, useRef, useState } from "react";
import {
    DeleteOutlined, UploadOutlined, EditOutlined, PlusOutlined, SearchOutlined,
} from "@ant-design/icons";
import { Button, Upload, Form, Input, Switch, Space, Table, Tag, notification, Spin } from "antd";
import * as HotelService from "../../services/HotelService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getBase64 } from "../../utils";
import { useNavigate } from "react-router";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import { RowContainer, FullWidthItem } from "./style";

const HotelList = () => {
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isModalDelete, setIsModalDelete] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [rowSelected, setRowSelected] = useState("");
    const [api, contextHolder] = notification.useNotification();
    const [loading, setLoading] = useState(false);

    const [stateHotelDetails, setStateHotelDetails] = useState({
        CodeHotel: "",
        NameHotel: "",
        Introduce: "",
        LocationHotel: "",
        image: "",
        Active: false,
    });

    const mutationUpdate = useMutation({
        mutationFn: async ({ id, data }) => {
            return await HotelService.updateHotel(id, data);
        },
    });

    const mutationDelete = useMutation({
        mutationFn: async ({ id }) => {
            return await HotelService.deleteHotel(id);
        },
    });

    const getAllHotels = async () => {
        setLoading(true); // Bật loading
        try {
            const res = await HotelService.getAllHotel();
            return res;
        } finally {
            setLoading(false); // Tắt loading khi xong
        }
    };

    const queryHotel = useQuery({
        queryKey: ["hotels"],
        queryFn: getAllHotels,
    });

    //delete product
    const { isLoading: isLoadingHotels, data: hotels = [] } = queryHotel;
    const { isLoading: isLoadingUpdate, data: dataUpdate } = mutationUpdate;
    const { isLoading: isLoadingDelete, data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted } = mutationDelete;

    // console.log("data update: ", dataUpdate)
    const dataTable =
        hotels?.data?.length &&
        hotels?.data?.map((p) => {
            return { ...p, key: p._id };
        });
    // console.log("dataTable", dataTable);

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
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
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

    // ✨ Hàm giúp chuyển đổi dữ liệu API thành format hợp lệ
    const mapHotelData = (data) => ({
        _id: data._id,
        CodeHotel: data.CodeHotel || "",
        NameHotel: data.NameHotel || "",
        Introduce: data.Introduce || "",
        LocationHotel: data.LocationHotel || "",
        Active: data.Active || false,
        image: data.image,
    });

    const fetchGetDetailsHotel = async (hotelId) => {
        if (!hotelId) return;
        try {
            const res = await HotelService.getHotelById(hotelId);
            if (res?.data) {
                console.log("Hotel Data from API:", res.data); // Debug API response
                setStateHotelDetails(mapHotelData(res.data));
            }
        } catch (error) {
            console.error("Failed to fetch hotel details:", error);
        }
    };

    console.log("StateHotelDetails:", stateHotelDetails);

    // Chỉ cập nhật khi có dữ liệu
    useEffect(() => {
        if (stateHotelDetails._id) {
            // console.log("Updating form with stateHotelDetails:", stateHotelDetails);
            form.setFieldsValue({
                CodeHotel: stateHotelDetails.CodeHotel,
                NameHotel: stateHotelDetails.NameHotel,
                Introduce: stateHotelDetails.Introduce,
                LocationHotel: stateHotelDetails.LocationHotel,
                image: stateHotelDetails.image,
                Active: stateHotelDetails.Active,
            });
        }
    }, [stateHotelDetails, form]);

    //delete hotel
    useEffect(() => {
        if (isSuccessDeleted && dataDeleted?.status === "OK") {
            api.success({ message: "Xóa hotel thành công!" });
            handleCancelDelete();
        } else if (isErrorDeleted) {
            api.error({ message: "Xóa hotel thất bại!" });
        }
    }, [isSuccessDeleted, isErrorDeleted, dataDeleted?.status]);

    useEffect(() => {
        if (rowSelected) {
            fetchGetDetailsHotel(rowSelected)
        }
    }, [rowSelected]);

    const handleDetailsHotel = () => {
        if (rowSelected) {
            fetchGetDetailsHotel(rowSelected)
        }
        console.log("rowSelected: ", rowSelected);
        // setRowSelected(record);
        setIsOpenDrawer(true);
    };

    const handleOnChangeDetail = (e) => {
        const { name, value, type, checked } = e.target || {};
        setStateHotelDetails((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value, // Nếu là checkbox (Switch), lấy giá trị checked
        }));
    };

    const onUpdateHotel = () => {
        const updateData = {
            CodeHotel: stateHotelDetails.CodeHotel,
            NameHotel: stateHotelDetails.NameHotel,
            Introduce: stateHotelDetails.Introduce,
            LocationHotel: stateHotelDetails.LocationHotel,
            Active: stateHotelDetails.Active,
            image: stateHotelDetails.image,
        };

        // console.log("🔥 Dữ liệu gửi lên BE:", updateData);

        mutationUpdate.mutate(
            { id: rowSelected, data: updateData },
            {
                onSuccess: () => {
                    api.success({ message: "Hotel updated successfully!" });
                    setIsOpenDrawer(false);
                    fetchGetDetailsHotel(rowSelected); // Lấy dữ liệu mới

                },
                onError: (error) => {
                    console.error("Update Hotel Error:", error);
                    api.error({ message: "Failed to update hotel!" });
                },
                onSettled: () => {
                    queryHotel.refetch()
                }
            }
        );
    };

    //delete hotel
    const handleCancelDelete = () => {
        setIsModalDelete(false);
        // console.log("handleDeteleProduct", rowSelected);
    };

    //delete product
    const handleDeleteHotel = () => {
        mutationDelete.mutate(
            { id: rowSelected },
            {
                onSettled: () => {
                    queryHotel.refetch();
                },
            }
        );
    };

    //get image product details
    const handleOnChangeImageDetails = async ({ fileList }) => {
        const file = fileList[0];
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setStateHotelDetails({
            ...stateHotelDetails,
            image: file.preview,
        });
    };

    const renderAction = () => {
        return (
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        background: "rgba(255, 165, 0, 0.2)", // Màu nền cam nhạt
                        padding: "8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 165, 0, 0.4)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 165, 0, 0.2)")}
                    onClick={handleDetailsHotel}
                >
                    <EditOutlined style={{ color: "orange", fontSize: "20px" }} />
                </div>

                <div
                    style={{
                        background: "rgba(255, 0, 0, 0.2)", // Màu nền đỏ nhạt
                        padding: "8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 0, 0, 0.4)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 0, 0, 0.2)")}
                    onClick={() => setIsModalDelete(true)}
                >
                    <DeleteOutlined style={{ color: "red", fontSize: "20px" }} />
                </div>
            </div>

        );
    };
    const columns = [
        {
            title: "Image Hotel",
            dataIndex: "image",
            key: "image",
            width: "8%",
            render: (image) =>
                image ? (
                    <img
                        src={image}
                        alt="Hotel"
                        style={{ width: "80%", height: 35, objectFit: "cover", borderRadius: 6 }}
                    />
                ) : (
                    "No Image"
                ),
        },
        {
            title: "Hotel Code",
            dataIndex: "CodeHotel",
            key: "CodeHotel",
            // width: "30%",
            ...getColumnSearchProps("CodeHotel"),
            sorter: (a, b) => a.CodeHotel.length - b.CodeHotel.length,
        },
        {
            title: "Name Hotel",
            dataIndex: "NameHotel",
            key: "NameHotel",
            // width: "20%",
            ...getColumnSearchProps("NameHotel"),
            sorter: (a, b) => a.NameHotel.length - b.NameHotel.length,
        },
        {
            title: "LocationHotel",
            dataIndex: "LocationHotel",
            key: "LocationHotel",
            ...getColumnSearchProps("LocationHotel"),
            sorter: (a, b) => a.LocationHotel.length - b.LocationHotel.length,
            sortDirections: ["descend", "ascend"],
        },
        {
            title: "Status",
            dataIndex: "Active",
            key: "Active",
            // ...getColumnSearchProps("Active"),
            render: (Active) => (
                <Tag color={Active ? "green" : "volcano"}>
                    {Active ? "Active" : "Inactive"}
                </Tag>
            ),
            filters: [
                { text: "Active", value: true },
                { text: "Inactive", value: false },
            ],
            onFilter: (value, record) => record.Active === value,
        },
        {
            title: "Action",
            dataIndex: "action",
            render: renderAction,
        },
    ];
    return (
        <>
            {contextHolder}
            <Button
                style={{
                    height: "90px",
                    width: "90px",
                    borderRadius: "6px",
                    borderStyle: "dashed",
                    marginBottom: "15px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onClick={() => navigate('/hotel/add-hotel')}
            >
                <PlusOutlined style={{ fontSize: "35px" }} />
                <div style={{ fontSize: "13px", fontWeight: "500" }}>
                    Add Hotel
                </div>
            </Button>
            <Spin spinning={loading}>
                <Table columns={columns} dataSource={dataTable}
                    loading={isLoadingHotels || isLoadingUpdate || isLoadingDelete}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: (event) => {
                                // console.log("Record Selected:", record);
                                setRowSelected(record._id);
                            }
                        };
                    }}
                />
            </Spin>


            <DrawerComponent
                title="Update Hotel"
                isOpen={isOpenDrawer}
                onClose={() => setIsOpenDrawer(false)}
                width="65%"
            >
                {/* <Loading isLoading={isLoadingUpdate}> */}
                <Form form={form} layout="vertical" onFinish={onUpdateHotel} autoComplete="on">

                    {/* Image Upload - Full width */}
                    <FullWidthItem>
                        <Form.Item name="image" label="Image">
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                {/* Hiển thị ảnh đã chọn */}
                                {stateHotelDetails?.image && (
                                    <img
                                        src={stateHotelDetails.image}
                                        alt="Preview"
                                        style={{
                                            width: 100,
                                            height: 100,
                                            objectFit: "cover",
                                            borderRadius: 8,
                                            border: "1px solid #ddd",
                                        }}
                                    />
                                )}

                                {/* Nút Upload bên cạnh */}
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
                            </div>
                        </Form.Item>
                    </FullWidthItem>

                    {/* Hotel Code & Name on the same row */}
                    <RowContainer>
                        <Form.Item name="CodeHotel" label="Hotel Code" rules={[{ required: true, message: "Please enter hotel code" }]}>
                            <Input value={stateHotelDetails.CodeHotel} onChange={handleOnChangeDetail} name="CodeHotel" placeholder="Enter hotel code" />
                        </Form.Item>
                        <Form.Item name="NameHotel" label="Hotel Name" rules={[{ required: true, message: "Please enter hotel name" }]}>
                            <Input value={stateHotelDetails.NameHotel} onChange={handleOnChangeDetail} name="NameHotel" placeholder="Enter hotel name" />
                        </Form.Item>
                    </RowContainer>

                    {/* Title & Location on the same row */}
                    <RowContainer>
                        <Form.Item name="LocationHotel" label="Location Hotel" rules={[{ required: true, message: "Please enter location" }]}>
                            <Input value={stateHotelDetails.LocationHotel} onChange={handleOnChangeDetail} name="LocationHotel" placeholder="Enter location" />
                        </Form.Item>
                        <Form.Item name="Active" label="Status" valuePropName="checked">
                            <Switch
                                checked={stateHotelDetails.Active}
                                onChange={(checked) =>
                                    setStateHotelDetails((prev) => ({ ...prev, Active: checked }))
                                }
                            />
                        </Form.Item>
                    </RowContainer>

                    {/* Introduction - Full width */}
                    <FullWidthItem>
                        <Form.Item name="Introduce" label="Introduction" rules={[{ required: true, message: "Please enter hotle introduction" }]}>
                            <Input.TextArea value={stateHotelDetails.Introduce} onChange={handleOnChangeDetail} name="Introduce" placeholder="Enter introduction" />
                        </Form.Item>
                    </FullWidthItem>

                    {/* Submit Button */}
                    <FullWidthItem>
                        <Button
                            style={{ backgroundColor: "rgb(121, 215, 190)", borderColor: "rgb(121, 215, 190)", color: "black" }}
                            htmlType="submit"
                        >
                            Update Hotel
                        </Button>
                    </FullWidthItem>

                </Form>
                {/* </Loading> */}
            </DrawerComponent>

            <ModalComponent
                title="Delete Hotel"
                open={isModalDelete}
                onOk={handleDeleteHotel}
                onCancel={handleCancelDelete}
            >
                <div>Are you sure you want to delete this hotel?</div>
            </ModalComponent>
        </>
    );
};

export default HotelList;
