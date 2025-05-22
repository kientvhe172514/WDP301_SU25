import React, { useEffect, useState } from "react";
import { Pencil, Check } from "lucide-react";
import * as getEmployeeDetail from "../../../services/EmployeeService";
import * as getAllHotelSevices from "../../../services/HotelService";
import * as getAllEmployeeType from "../../../services/EmployeeService";
import * as updateEmployeeWithSchedule from "../../../services/EmployeeService";
import { EmployeesDetailPage, Card } from "./style";
import { useParams } from "react-router";

const EmployeeDetail = () => {
    const [employee, setEmployee] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedEmployee, setEditedEmployee] = useState({});

    const [employeeType, setEmployeeType] = useState(null);
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [selectedEmployeeType, setselectedEmployeeType] = useState("");
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState("");
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState("");
    const [editedSchedule, setEditedSchedule] = useState([]);


    const { id } = useParams();

    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                const res = await getEmployeeDetail.getDetailsEmployee(id);
                if (res) {
                    setEmployee(res.employees);
                    setHotel(res.hotels);
                    setEmployeeType(res.employee_types);
                    setSchedule(res.schedule);
                    setEditedEmployee(res.employees);
                    if (res.employees?.hotels?.[0]?._id) {
                        setSelectedHotel(res.employees.hotels[0]._id);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết nhân viên:", error);
            }
        };

        if (id) {
            fetchEmployeeDetails();
        }
    }, [id]);

    useEffect(() => {
        const fetchEmployeeType = async () => {
            try {
                const response = await getAllEmployeeType.getAllEmployeeType();
                if (response?.status === "OK" && Array.isArray(response.data)) {
                    setEmployeeTypes(response.data);
                    setselectedEmployeeType(response.data[0]?._id || "");
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách khách sạn:", error);
            }
        };

        fetchEmployeeType();
    }, []);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await getAllHotelSevices.getAllHotel();
                if (response?.status === "OK" && Array.isArray(response.data)) {
                    setHotels(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách khách sạn:", error);
            }
        };

        fetchHotels();
    }, []);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await getAllEmployeeType.getAllPermission();
                if (response?.status === "OK" && Array.isArray(response.data)) {
                    const filteredPermissions = response.data.filter(permission =>
                        !permission.PermissionName.includes("Admin") &&
                        !permission.PermissionName.includes("Manager")
                    );
                    setPermissions(filteredPermissions);
                    setSelectedPermissions(filteredPermissions[0]?._id || "");
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách quyền:", error);
            }
        };

        fetchPermissions();
    }, []);



    const toggleEdit = () => {
        if (!isEditing) {
            setEditedEmployee({ ...employee });
            setEditedSchedule([...schedule]);
            if (employee?.hotels?.[0]?._id) {
                setSelectedHotel(employee.hotels[0]._id);
            }
            setSelectedPermissions(employee?.account?.permissions?.[0]?._id || "");
        }
        setIsEditing(!isEditing);
    };




    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedEmployee((prev) => ({ ...prev, [name]: value }));
    };

    const formatTime = (time) => {
        if (!time) return "N/A";
        let [hour, minute] = time.split(":").map(Number);
        let period = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    if (!employee) {
        return <p>Loading...</p>;
    }



    const handleSave = async () => {
        try {
            // Tạo object chứa dữ liệu cần cập nhật
            const employeeData = {
                FullName: editedEmployee.FullName || employee.FullName,
                Phone: editedEmployee.Phone || employee.Phone,
                Email: editedEmployee.Email || employee.Email,
                Gender: editedEmployee.Gender || employee.Gender,
                Image: editedEmployee.Image || employee.Image,
                Address: editedEmployee.Address || employee.Address,
                // Giữ nguyên hotel cũ nếu không chọn hotel mới
                hotels: selectedHotel ? [selectedHotel] : employee.hotels,
                employee_types: [selectedEmployeeType || employee.employee_types?.[0]?._id],
                account: {
                    FullName: editedEmployee.FullName || employee.FullName,
                    permissions: [selectedPermissions || employee?.accountId?.permissions?.[0]?._id],
                },
                schedule: editedSchedule.map(s => ({
                    date: s.date || "",
                    start_time: s.start_time || "",
                    end_time: s.end_time || ""
                }))
            };

            // Kiểm tra xem có thay đổi nào không
            const hasChanges =
                employeeData.FullName !== employee.FullName ||
                employeeData.Gender !== employee.Gender ||
                employeeData.Address !== employee.Address ||
                (selectedHotel && employeeData.hotels[0] !== employee.hotels?.[0]?._id) ||
                employeeData.employee_types[0] !== employee.employee_types?.[0]?._id ||
                employeeData.account.permissions[0] !== employee?.accountId?.permissions?.[0]?._id ||
                JSON.stringify(employeeData.schedule) !== JSON.stringify(schedule);

            if (!hasChanges) {
                alert("Không có thay đổi nào để cập nhật!");
                setIsEditing(false);
                return;
            }

            // Gọi API cập nhật
            const res = await updateEmployeeWithSchedule.updateEmployee(id, employeeData);
            if (res?.status === "OK") {
                setEmployee(employeeData);
                setIsEditing(false);
                alert("Cập nhật thành công!");
                // Load lại trang
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                console.error("Lỗi khi cập nhật nhân viên:", res);
                alert("Có lỗi xảy ra khi cập nhật!");
            }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert("Có lỗi xảy ra khi cập nhật!");
        }
    };





    return (
        <EmployeesDetailPage>
            <Card className="flex items-center p-6 bg-gray-100">
                <img
                    alt="Employee"
                    className="w-24 h-24 rounded-full border-2 border-gray-300"
                    src={employee?.Image}
                    style={{ width: "100px", height: "100px", borderRadius: "50%", border: "2px solid gray" }}
                />
                <div className="ml-6">
                    <h2 className="text-xl font-semibold">{editedEmployee?.FullName}</h2>
                </div>
            </Card>

            <InformationCard title="Thông tin cá nhân" isEditing={isEditing} toggleEdit={toggleEdit}>
                <p><strong>FullName:</strong> {isEditing ? <input name="FullName" value={editedEmployee?.FullName || ""} onChange={handleInputChange} /> : employee?.FullName}</p>
                <p><strong>Email:</strong> {employee?.Email}</p> {/* Giữ nguyên, không cho chỉnh sửa */}
                <p><strong>Giới tính:</strong> {isEditing ? <input name="Gender" value={editedEmployee?.Gender || ""} onChange={handleInputChange} /> : employee?.Gender}</p>
                <p><strong>Số điện thoại:</strong> {employee?.Phone}</p> {/* Giữ nguyên, không cho chỉnh sửa */}
                <p><strong>Địa chỉ:</strong> {isEditing ? <input name="Address" value={editedEmployee?.Address || ""} onChange={handleInputChange} /> : employee?.Address}</p>
            </InformationCard>


            {hotel && (
                <InformationCard title="Thông tin nơi làm việc" isEditing={isEditing} toggleEdit={toggleEdit}>
                    <p><strong>Mã khách sạn: </strong> {hotel?.CodeHotel}</p>
                    <p>
                        <strong>Tên khách sạn: </strong>
                        {!isEditing ? (
                            hotel?.NameHotel
                        ) : (
                            <select
                                value={selectedHotel || hotel?._id}
                                onChange={(e) => setSelectedHotel(e.target.value)}
                                style={{ marginLeft: "10px" }} // Để dropdown nằm cạnh chữ "Tên khách sạn:"
                            >
                                {hotels.map((h) => (
                                    <option key={h._id} value={h._id}>{h.NameHotel}</option>
                                ))}
                            </select>
                        )}
                    </p>
                    <p><strong>Địa chỉ: </strong> {hotel?.LocationHotel}</p>
                </InformationCard>

            )}

            {employeeType && (
                <InformationCard title="Thông tin công việc & quyền" isEditing={isEditing} toggleEdit={toggleEdit}>
                    <p>
                        <strong>Loại công việc: </strong>
                        {!isEditing ? (
                            employeeType?.EmployeeType
                        ) : (
                            <select
                                value={selectedEmployeeType || employeeType?._id}
                                onChange={(e) => setselectedEmployeeType(e.target.value)}
                                style={{ marginLeft: "10px" }}
                            >
                                {employeeTypes.map((type) => (
                                    <option key={type._id} value={type._id}>{type.EmployeeType}</option>
                                ))}
                            </select>
                        )}
                    </p>
                    <p>
                        <strong>Quyền hạn: </strong>
                        {!isEditing ? (
                            employee?.accountId?.permissions?.[0]?.Note // Hiển thị quyền hạn nếu không chỉnh sửa
                        ) : (
                            <select
                                value={selectedPermissions || employee?.accountId?.permissions?.[0]?._id} // Nếu không chọn gì, lấy quyền cũ hoặc quyền đầu tiên
                                onChange={(e) => setSelectedPermissions(e.target.value)} // Cập nhật selectedPermissions khi thay đổi
                                style={{ marginLeft: "10px" }}
                            >
                                {permissions.map((perm) => (
                                    <option key={perm._id} value={perm._id}>
                                        {perm.Note}
                                    </option>
                                ))}
                            </select>
                        )}
                    </p>
                </InformationCard>
            )}

            {schedule.length > 0 && (
                <InformationCard title="Lịch làm việc" isEditing={isEditing} toggleEdit={toggleEdit}>
                    {(isEditing ? editedSchedule : schedule).map((item, index) => (
                        <div key={item._id} className="mb-2">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <label><strong>Ngày bắt đầu:</strong></label>
                                    <input
                                        type="date"
                                        value={item?.date || ""}
                                        onChange={(e) => {
                                            const updatedSchedule = [...editedSchedule];
                                            updatedSchedule[index] = { ...updatedSchedule[index], date: e.target.value };
                                            setEditedSchedule(updatedSchedule);
                                        }}
                                    />

                                    <label><strong>Giờ làm:</strong></label>
                                    <input
                                        type="time"
                                        value={item?.start_time || ""}
                                        onChange={(e) => {
                                            const updatedSchedule = [...editedSchedule];
                                            updatedSchedule[index] = { ...updatedSchedule[index], start_time: e.target.value };
                                            setEditedSchedule(updatedSchedule);
                                        }}
                                    />

                                    <span>-</span>

                                    <input
                                        type="time"
                                        value={item?.end_time || ""}
                                        onChange={(e) => {
                                            const updatedSchedule = [...editedSchedule];
                                            updatedSchedule[index] = { ...updatedSchedule[index], end_time: e.target.value };
                                            setEditedSchedule(updatedSchedule);
                                        }}
                                    />
                                </div>
                            ) : (
                                <p>
                                    <strong>Ngày bắt đầu:</strong> {item?.date} |
                                    <strong> Giờ làm:</strong> {formatTime(item?.start_time)} - {formatTime(item?.end_time)}
                                </p>
                            )}
                        </div>
                    ))}
                </InformationCard>
            )}
            {/* Nút Lưu thay đổi & Submit */}
            {isEditing && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <button
                        type="submit"
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            backgroundColor: "#79D7BE",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            transition: "background-color 0.3s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#66C6A1"} // Hover effect
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#79D7BE"} // Hover effect
                        onClick={handleSave}>
                        Submit
                    </button>
                </div>
            )}
        </EmployeesDetailPage>
    );
};

const InformationCard = ({ title, children, isEditing, toggleEdit }) => {
    return (
        <Card className="mt-6 p-4 border border-gray-300">
            <div style={{ display: "flex" }}>
                <div style={{ flex: 1 }}>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <div className="mt-4">{children}</div>
                </div>
                <button style={{ height: "35px" }} className="text-gray-500 hover:text-gray-700 p-1" onClick={toggleEdit}>
                    {isEditing ? <Check size={25} /> : <Pencil size={20} />}
                </button>
            </div>
        </Card>

    );
};

export default EmployeeDetail;
