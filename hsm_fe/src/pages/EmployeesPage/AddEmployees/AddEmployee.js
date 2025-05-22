import React, { useEffect, useRef, useState } from 'react';
import * as getAllEmployeeType from "../../../services/EmployeeService";
import * as getAllHotelSevices from "../../../services/HotelService";
import * as getAllEmployeeSchedule from "../../../services/EmployeeScheduleService";
import * as getAllAccountServices from "../../../services/accountService";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";

import {
    AddEmployeesPage,
    Card,
    Label,
    Input,
    RadioGroup,
    RadioGroupItem,
} from "./style";
// Main component
const AddEmployees = () => {

    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hotels, setHotels] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const formRef = useRef();

    // Cập nhật schedule khi chọn ngày & giờ
    const getVietnamDate = () => {
        const now = new Date();
        now.setHours(now.getHours() + 7); // Điều chỉnh theo GMT+7
        return now.toISOString().split("T")[0]; // Lấy phần YYYY-MM-DD
    };

    const handleScheduleChange = (e) => {
        const { name, value } = e.target;

        // Kiểm tra nếu giá trị giờ hợp lệ (trong khoảng 01:00 - 23:59)
        const isValidTime = (time) => {
            const regex = /^(0[1-9]|1\d|2[0-3]):([0-5]\d)$/; // Hỗ trợ 01:00 - 23:59
            return regex.test(time);
        };

        if (name === "start_time" || name === "end_time") {
            if (!isValidTime(value)) {
                alert("Giờ không hợp lệ! Vui lòng nhập giá trị từ 01:00 đến 23:59.");
                return;
            }
        }

        // Lấy ngày hiện tại theo múi giờ Việt Nam
        const today = getVietnamDate();

        setFormDataES((prev) => ({
            ...prev,
            schedule: prev.schedule.length > 0
                ? [{ ...prev.schedule[0], date: prev.schedule[0].date || today, [name]: value }]
                : [{ date: today, start_time: "", end_time: "", [name]: value }],
        }));
    };





    // Xử lý khi chọn ảnh
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result; // Chuỗi Base64 của ảnh
            setSelectedImage(base64String); // Hiển thị ảnh trước khi lưu
            setFormData((prev) => ({ ...prev, Image: base64String })); // Lưu Base64 vào formData
        };
        reader.onerror = (error) => {
            console.error("Lỗi khi chuyển ảnh thành Base64:", error);
        };
    };

    //add account
    const [formDataAccount, setFormDataAccount] = useState({
        FullName: "",
        Email: "",
        Username: "",
        Password: "",
        permissions: "",

    });
    //add employee
    const [formData, setFormData] = useState({
        FullName: "",
        Address: "",
        Email: "",
        Phone: "",
        Gender: "",
        Image: "",
    });

    //add employeeschedule
    const [formDataES, setFormDataES] = useState({
        employees: "",
        hotels: "",
        employee_types: "",
        schedule: [
            {
                date: getVietnamDate(),
                start_time: "",
                end_time: "",
            }
        ],
    });


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // Kiểm tra email hợp lệ
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!formData.Email) {
            newErrors.email = "Email không được để trống";
        } else if (!emailRegex.test(formData.Email)) {
            newErrors.email = "Email không đúng định dạng";
        }

        // Kiểm tra số điện thoại hợp lệ
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!formData.Phone) {
            newErrors.phone = "Số điện thoại không được để trống";
        } else if (!phoneRegex.test(formData.Phone)) {
            newErrors.phone = "Số điện thoại không đúng định dạng";
        }

        if (!formData.FullName) {
            newErrors.fullName = "Tên nhân viên không được bỏ trống.";
        }
        if (!formData.Address) {
            newErrors.address = "Địa chỉ không được bỏ trống.";
        }
        if (!formDataAccount.Username) {
            newErrors.username = "Username không được bỏ trống.";
        }
        // Kiểm tra mật khẩu hợp lệ: ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!formDataAccount.Password) {
            newErrors.password = "Password không được bỏ trống.";
        } else if (!passwordRegex.test(formDataAccount.Password)) {
            newErrors.password = "Password phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // **1. Tạo Account trước**
            const accountData = {
                FullName: formData.FullName,
                Email: formData.Email,
                Username: formDataAccount.Username,
                Password: formDataAccount.Password,
                permissions: [selectedPermissions],
            };

            console.log("Submitting account data:", accountData);
            const accountRes = await getAllAccountServices.createAccount(accountData);

            if (accountRes?.status === "OK" && accountRes.data?._id) {
                const newAccountId = accountRes.data._id; // Lấy ID Account vừa tạo
                console.log("New Account ID:", newAccountId);

                // **2. Tạo Employee sau khi Account được tạo**
                const employeeData = {
                    hotels: [selectedHotel],
                    FullName: formData.FullName,
                    Phone: formData.Phone,
                    Email: formData.Email,
                    Gender: formData.Gender,
                    Image: formData.Image,
                    Address: formData.Address,
                    accountId: newAccountId, // Gán ID Account vào Employee
                };

                console.log("Submitting employee data:", employeeData);
                const employeeRes = await getAllEmployeeType.createEmployee(employeeData);

                if (employeeRes?.status === "OK" && employeeRes.data?._id) {
                    const newEmployeeId = employeeRes.data._id;
                    console.log("New Employee ID:", newEmployeeId);

                    // **3. Thêm vào EmployeeSchedule**
                    const employeeScheduleData = {
                        employees: newEmployeeId,
                        hotels: selectedHotel,
                        employee_types: formDataES.employee_types,
                        schedule: formDataES.schedule,
                    };

                    console.log("Submitting employee schedule data:", employeeScheduleData);
                    const scheduleRes = await getAllEmployeeSchedule.createEmployeeSchedule(employeeScheduleData);

                    if (scheduleRes?.status === "OK") {
                        alert("Thêm tài khoản, nhân viên và lịch làm việc thành công!");

                        // Reset form
                        setFormDataAccount({
                            FullName: "",
                            Email: "",
                            Username: "",
                            Password: "",
                            permissions: "",
                        });
                        setFormData({
                            FullName: "",
                            Address: "",
                            Email: "",
                            Phone: "",
                            Gender: "",
                            Image: "",
                        });
                        setFormDataES({
                            employees: "",
                            hotels: "",
                            employee_types: "",
                            schedule: [
                                {
                                    date: getVietnamDate(),
                                    start_time: "",
                                    end_time: "",
                                }
                            ],
                        });
                        setSelectedHotel("");
                        setSelectedPermissions("");
                        setIsChecked(false);
                        formRef.current?.reset();
                        window.location.reload();
                    } else {
                        alert("Lỗi khi thêm lịch làm việc.");
                    }
                } else {
                    alert("Lỗi khi thêm nhân viên.");
                }
            } else if (accountRes?.status === "error" && accountRes?.message === "The email already exists") {
                alert("Email đã tồn tại. Vui lòng thử lại với email khác.");
            } else {
                alert("Lỗi khi tạo tài khoản.");
            }
        } catch (error) {
            console.error("Lỗi từ API: ", error);
            alert("Đã có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    // Cập nhật state khi chọn radio button
    const handleRadioChange = (e) => {
        setFormDataES((prev) => ({
            ...prev,
            employee_types: e.target.value,
        }));
    };


    // Fetch employee types
    useEffect(() => {
        const getAllEType = async () => {
            try {
                const res = await getAllEmployeeType.getAllEmployeeType();
                if (res?.status === "OK" && Array.isArray(res.data)) {
                    setEmployeeTypes(res.data);
                }
            } catch (error) {
                console.error("Error fetching employee types:", error);
            } finally {
                setLoading(false);
            }
        };

        getAllEType();
    }, []);

    // Fetch all hotels
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await getAllHotelSevices.getAllHotel();
                if (response?.status === "OK" && Array.isArray(response.data)) {
                    setHotels(response.data);
                    setSelectedHotel(response.data[0]?._id || ""); // Lấy ID thay vì NameHotel
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách khách sạn:", error);
            }
        };

        fetchHotels();
    }, []);

    // Fetch all permissions
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await getAllEmployeeType.getAllPermission();
                if (response?.status === "OK" && Array.isArray(response.data)) {
                    // Lọc bỏ các quyền có PermissionName là "Admin"
                    const filteredPermissions = response.data.filter(permission =>
                        !permission.PermissionName.includes("Admin") &&
                        !permission.PermissionName.includes("Manager")
                    );

                    setPermissions(filteredPermissions);
                    setSelectedPermissions(filteredPermissions[0]?._id || ""); // Lấy ID của quyền đầu tiên nếu có
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách quyền:", error);
            }
        };

        fetchPermissions();
    }, []);


    // Handle input change
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));

        // Xử lý validation
        const newErrors = { ...errors };

        if (id === "Email") {
            if (!value) {
                newErrors.email = "Email không được để trống";
            } else {
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                if (!emailRegex.test(value)) {
                    newErrors.email = "Email không đúng định dạng";
                } else {
                    delete newErrors.email;
                }
            }
        }

        if (id === "Phone") {
            if (!value) {
                newErrors.phone = "Số điện thoại không được để trống";
            } else {
                const phoneRegex = /^[0-9]{10,15}$/;
                if (!phoneRegex.test(value)) {
                    newErrors.phone = "Số điện thoại không đúng định dạng";
                } else {
                    delete newErrors.phone;
                }
            }
        }

        setErrors(newErrors);
    };
    // Handle input Account
    const handleInputAccountChange = (e) => {
        const { id, value } = e.target;
        setFormDataAccount((prev) => ({ ...prev, [id]: value }));

        // Kiểm tra lỗi trực tiếp khi nhập
        const newErrors = { ...errors };

        if (id === "Username" && !value.trim()) {
            newErrors.username = "Username không được bỏ trống.";
        } else {
            delete newErrors.username;
        }

        if (id === "Password") {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!value) {
                newErrors.password = "Password không được bỏ trống.";
            } else if (!passwordRegex.test(value)) {
                newErrors.password = "Password phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
            } else {
                delete newErrors.password;
            }
        }

        setErrors(newErrors);
    };


    // Handle gender selection
    const handleGenderChange = (e) => {
        setFormData((prevData) => ({ ...prevData, Gender: e.target.value }));
    };

    // Handle checkbox change
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    return (
        <AddEmployeesPage>
            <Card>
                <div style={{ maxHeight: "90vh", overflowY: "auto", paddingRight: "10px" }}>
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div>
                            <div className="image-container">
                                {selectedImage ? (
                                    <img
                                        src={selectedImage}
                                        alt="Employee Preview"
                                        className="profile-image"
                                        style={{ height: "100px", width: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" }}
                                    />
                                ) : (
                                    <div className="default-icon" style={{ fontSize: "80px", color: "#ccc" }}>
                                        <i className="bi bi-person-circle"></i>
                                    </div>
                                )}
                            </div>
                            <label
                                style={{
                                    display: "inline-block",
                                    padding: "8px 12px",
                                    cursor: "pointer",
                                    backgroundColor: "#ccc",
                                    borderRadius: "4px",
                                    fontSize: "14px",
                                    textAlign: "center"
                                }}
                            >
                                Chọn ảnh
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                            </label>
                        </div>


                        <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>

                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <Label style={{ fontSize: "20px" }} htmlFor="FullName">
                                    <span style={{ color: "red", fontSize: "25px" }}>*</span>Employee Name
                                </Label>
                                <Input id="FullName" value={formData.FullName} onChange={handleInputChange} placeholder="Input" />
                                {errors.fullName && <span style={{ color: "red" }}>{errors.fullName}</span>}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <Label style={{ fontSize: "20px" }} htmlFor="Address">
                                    <span style={{ color: "red", fontSize: "25px" }}>*</span>Address
                                </Label>
                                <Input id="Address" value={formData.Address} onChange={handleInputChange} placeholder="Input" />
                                {errors.address && <span style={{ color: "red" }}>{errors.address}</span>}
                            </div>
                        </div>
                        <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <Label style={{ fontSize: "20px" }} htmlFor="Email">
                                    <span style={{ color: "red", fontSize: "25px" }}>*</span>Email
                                </Label>
                                <Input id="Email" value={formData.Email} onChange={handleInputChange} placeholder="Input" />
                                {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <Label style={{ fontSize: "20px" }} htmlFor="Phone">
                                    <span style={{ color: "red", fontSize: "25px" }}>*</span>Phone
                                </Label>
                                <Input id="Phone" value={formData.Phone} onChange={handleInputChange} placeholder="Input" />
                                {errors.phone && <span style={{ color: "red" }}>{errors.phone}</span>}
                            </div>
                        </div>
                        <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <Label style={{ fontSize: "20px" }} htmlFor="UserName">
                                    <span style={{ color: "red", fontSize: "25px" }}>*</span>UserName
                                </Label>
                                <Input id="Username" value={formDataAccount.Username} onChange={handleInputAccountChange} placeholder="Input" />
                                {errors.username && <span style={{ color: "red" }}>{errors.username}</span>}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <Label style={{ fontSize: "20px" }} htmlFor="PassWord">
                                    <span style={{ color: "red", fontSize: "25px" }}>*</span>PassWord
                                </Label>
                                <Input id="Password" value={formDataAccount.Password} onChange={handleInputAccountChange} placeholder="Input" />
                                {errors.password && <span style={{ color: "red" }}>{errors.password}</span>}
                            </div>
                        </div>

                        <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
                            <div style={{ flex: 1 }}>
                                <Label style={{ fontSize: "20px", marginBottom: "10px" }}>
                                    Hotel Name
                                </Label>
                                <select className="form-select" value={selectedHotel} onChange={(e) => setSelectedHotel(e.target.value)}>
                                    {hotels.map((hotel) => (
                                        <option key={hotel._id} value={hotel._id}>
                                            {hotel.NameHotel}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Label style={{ fontSize: "20px", marginBottom: "10px" }}>
                                    Permission
                                </Label>
                                <select className="form-select" value={selectedPermissions} onChange={(e) => setSelectedPermissions(e.target.value)}>
                                    {permissions.map((perm) => (
                                        <option key={perm._id} value={perm._id}>
                                            {perm.Note}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: "30px" }}>
                            <Label style={{ fontSize: "20px" }}>Gender</Label>
                            <RadioGroup>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <RadioGroupItem id="female" type="radio" value="female" name="gender" onChange={handleGenderChange} />
                                    <Label htmlFor="female">Female</Label>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <RadioGroupItem id="male" type="radio" value="male" name="gender" onChange={handleGenderChange} />
                                    <Label htmlFor="male">Male</Label>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <RadioGroupItem id="notSay" type="radio" value="notSay" name="gender" onChange={handleGenderChange} />
                                    <Label htmlFor="notSay">Rather not say</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div style={{ marginTop: "30px" }}>
                            <div className="form-check form-switch" style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "15px" }}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="flexSwitchCheckDefault"
                                    style={{ transform: "scale(1.5)" }}
                                    onChange={handleCheckboxChange}
                                />
                                <Label
                                    style={{ fontSize: "20px", margin: "0", }}
                                    htmlFor="flexSwitchCheckDefault"
                                >
                                    <span style={{ color: "red", fontSize: "25px" }}>*</span>Additional Information
                                </Label>

                            </div>
                            {/* Nếu checkbox bật thì hiển thị phần chọn thời gian làm việc */}
                            {isChecked && (
                                <div style={{ marginTop: "20px" }}>
                                    {/* Employment Type */}
                                    <div style={{ marginTop: "30px" }}>
                                        <Label style={{ fontSize: "20px", marginBottom: "10px" }}>Employment Type</Label>
                                        {loading ? (
                                            <p>Loading...</p>
                                        ) : (
                                            <div>
                                                {employeeTypes.map((item) => (
                                                    <div
                                                        key={item._id}
                                                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                                                    >
                                                        <input
                                                            id={item._id}
                                                            type="radio"
                                                            value={item._id}
                                                            name="job"
                                                            checked={formDataES.employee_types === item._id}
                                                            onChange={handleRadioChange}
                                                        />
                                                        <label htmlFor={item._id}>{item.EmployeeType}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Date Picker */}
                                    <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
                                        <Label style={{ fontSize: "20px", marginRight: "10px" }}>
                                            Date of Job:
                                        </Label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formDataES.schedule[0]?.date || getVietnamDate()}
                                            onChange={handleScheduleChange}
                                            min={getVietnamDate()}
                                        />
                                    </div>


                                    {/* Time Picker */}
                                    <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
                                        <Label style={{ fontSize: "20px" }} htmlFor="start_time">
                                            Select Working Hours:
                                        </Label>
                                        <input
                                            type="time"
                                            id="start_time"
                                            name="start_time"
                                            value={formDataES.schedule[0]?.start_time || ""}
                                            onChange={handleScheduleChange}
                                            step="60"
                                            min="00:00"
                                            max="23:59"
                                            style={{ marginLeft: "10px" }}
                                        />
                                        <span style={{ margin: "0 10px" }}>to</span>
                                        <input
                                            type="time"
                                            id="end_time"
                                            name="end_time"
                                            value={formDataES.schedule[0]?.end_time || ""}
                                            onChange={handleScheduleChange}
                                            step="60"
                                            min="00:00"
                                            max="23:59"
                                        />
                                    </div>

                                </div>
                            )}
                        </div>

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
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </Card>
        </AddEmployeesPage>
    );
};

export default AddEmployees;

