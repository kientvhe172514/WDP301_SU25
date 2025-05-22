import React, { useEffect, useState, useRef } from "react";
import * as getAllHotelSevices from "../../services/HotelService";
import * as getAllRoomAndTypeRoom from "../../services/RoomService";
import * as getAllBooking from "../../services/BookingService";
import { io } from "socket.io-client";

const socket = io("http://localhost:9999", {
    reconnectionAttempts: 3, // Giới hạn số lần kết nối lại
    transports: ["websocket"], // Chỉ dùng WebSocket để tránh polling chậm
});

// Constants for localStorage
const NOTIFICATIONS_STORAGE_KEY = 'booking_notifications';
const NOTIFICATION_EXPIRY_YEARS = 1;
const UNREAD_COUNT_KEY = 'unread_notifications_count';

// Helper functions for localStorage
const saveNotificationsToStorage = (notifications) => {
    try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
        console.error('Error saving notifications to localStorage:', error);
    }
};

const loadNotificationsFromStorage = () => {
    try {
        const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (!storedNotifications) return [];

        const notifications = JSON.parse(storedNotifications);
        const currentTime = new Date().getTime();

        // Filter out notifications older than 1 year
        const validNotifications = notifications.filter(noti => {
            const notificationTime = new Date(noti.timestamp).getTime();
            return currentTime - notificationTime < (NOTIFICATION_EXPIRY_YEARS * 365 * 24 * 60 * 60 * 1000);
        });

        // Update storage with filtered notifications
        if (validNotifications.length !== notifications.length) {
            saveNotificationsToStorage(validNotifications);
        }

        return validNotifications;
    } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
        return [];
    }
};

const saveUnreadCount = (count) => {
    try {
        localStorage.setItem(UNREAD_COUNT_KEY, count.toString());
    } catch (error) {
        console.error('Error saving unread count:', error);
    }
};

const getUnreadCount = () => {
    try {
        return parseInt(localStorage.getItem(UNREAD_COUNT_KEY) || '0');
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
};

///
const formatDateVN = (date) => {
    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh"
    }).format(date);
};

const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Nếu là Chủ nhật thì lùi về thứ Hai
    d.setDate(d.getDate() + diff);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); // Chuyển về chuẩn UTC
};

const generateDates = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    while (currentDate <= new Date(end)) {
        dates.push(new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

const getDayOfWeek = (date) => {
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    return days[(date.getDay() + 6) % 7];
};
//nhận được message thì lưu ở đây "new_booking" vào database
const BookingLog = () => {
    const [notifications, setNotifications] = useState([]);
    const notificationsRef = useRef([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [highlightedCells, setHighlightedCells] = useState([]);

    // Load notifications and unread count from localStorage on component mount
    useEffect(() => {
        const storedNotifications = loadNotificationsFromStorage();
        const storedUnreadCount = getUnreadCount();
        setNotifications(storedNotifications);
        notificationsRef.current = storedNotifications;
        setUnreadCount(storedUnreadCount);
    }, []);

    //
    const today = new Date();
    const defaultStartDate = getMondayOfWeek(today);
    const defaultEndDate = new Date(defaultStartDate);
    defaultEndDate.setDate(defaultStartDate.getDate() + 6);

    const [startDate, setStartDate] = useState(defaultStartDate.toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(defaultEndDate.toISOString().split("T")[0]);
    const [dates, setDates] = useState(generateDates(defaultStartDate, defaultEndDate));
    const [showTable, setShowTable] = useState(true);

    const [selectedHotels, setSelectedHotels] = useState("");
    const [hotels, setHotels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [bookings, setBookings] = useState([]);

    const groupRoomsByType = () => {
        const grouped = {};

        rooms.forEach((room) => {
            if (!room.roomtype) return;

            // const roomType = roomTypes.find((rt) => rt._id.toString() === room.roomtype.toString());
            const roomType = roomTypes.find((rt) => String(rt._id) === String(room.roomtype._id));

            if (!roomType) return;

            if (!grouped[roomType.TypeName]) {
                grouped[roomType.TypeName] = [];
            }

            const roomBookings = bookings.filter((b) =>
                b.rooms && b.rooms._id.toString() === room._id.toString()
            );

            if (roomBookings.length === 0) {
                grouped[roomType.TypeName].push({
                    name: room.RoomName,
                    status: dates.map(() => "Available"),
                });
                return;
            }

            let earliestCheckinDate = new Date(Math.min(...roomBookings.map((b) => {
                const checkin = new Date(b.Time.Checkin);
                return Date.UTC(checkin.getFullYear(), checkin.getMonth(), checkin.getDate());
            })));

            let latestCheckoutDate = new Date(Math.max(...roomBookings.map((b) => {
                const checkout = new Date(b.Time.Checkout);
                return Date.UTC(checkout.getFullYear(), checkout.getMonth(), checkout.getDate(), 23, 59, 59);
            })));

            grouped[roomType.TypeName].push({
                name: room.RoomName,
                status: dates.map((date) => {
                    const checkDateTimestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

                    if (checkDateTimestamp < earliestCheckinDate || checkDateTimestamp > latestCheckoutDate) {
                        return "Available";
                    }

                    const bookingStatus = roomBookings.find((b) => {
                        const checkin = new Date(b.Time.Checkin);
                        const checkout = new Date(b.Time.Checkout);
                        const checkinTimestamp = Date.UTC(checkin.getFullYear(), checkin.getMonth(), checkin.getDate());
                        const checkoutTimestamp = Date.UTC(checkout.getFullYear(), checkout.getMonth(), checkout.getDate());
                        return checkDateTimestamp >= checkinTimestamp && checkDateTimestamp <= checkoutTimestamp;
                    });

                    if (!bookingStatus) {
                        return "Available";
                    } else if (bookingStatus.Status === "Pending") {
                        return "Pending";
                    } else if (bookingStatus.Status === "Completed") {
                        return "Booked";
                    }

                    return "Available";
                }),
            });
        });

        return Object.entries(grouped).map(([category, rooms]) => ({
            category,
            rooms,
        }));
    };

    // Function to fetch updated data
    const fetchUpdatedData = async () => {
        try {
            if (!selectedHotels) return;

            // Fetch updated bookings
            const bookingsResponse = await getAllBooking.getAllBookingsByHotelId(selectedHotels);
            if (bookingsResponse && Array.isArray(bookingsResponse)) {
                setBookings(bookingsResponse);
            }

            // Fetch updated rooms
            const roomsResponse = await getAllRoomAndTypeRoom.getAllRoomByHotelId(selectedHotels);
            if (roomsResponse?.status === "OK") {
                setRooms(roomsResponse.data);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật dữ liệu:", error);
        }
    };

    //Fetch bookings khi chọn khách sạn
    useEffect(() => {
        const fetchBookings = async () => {
            if (!selectedHotels) return;

            try {
                console.log("Fetching bookings for hotel ID:", selectedHotels);
                const response = await getAllBooking.getAllBookingsByHotelId(selectedHotels);

                console.log("API response:", response);

                if (!response || !Array.isArray(response)) {
                    console.warn("API trả về dữ liệu không hợp lệ:", response);
                    setBookings([]);
                    return;
                }

                setBookings(response);
                console.log("Danh sách đặt phòng:", response);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đặt phòng:", error);
                setBookings([]);
            }
        };

        fetchBookings();
    }, [selectedHotels]);

    // Fetch all hotels
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await getAllHotelSevices.getAllHotel();
                if (response?.status === "OK" && Array.isArray(response.data)) {
                    setHotels(response.data);
                    setSelectedHotels(response.data[0]?._id || ""); // Lấy ID thay vì NameHotel
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách khách sạn:", error);
            }
        };

        fetchHotels();
    }, []);
    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const response = await getAllRoomAndTypeRoom.getAllTypeRoom();
                if (response?.status === "OK") {
                    setRoomTypes(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách loại phòng:", error);
            }
        };

        fetchRoomTypes();
    }, []);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                if (!selectedHotels) return;

                const response = await getAllRoomAndTypeRoom.getAllRoomByHotelId(selectedHotels);
                if (response?.status === "OK") {
                    setRooms(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách phòng:", error);
            }
        };

        fetchRooms();
    }, [selectedHotels]);



    const handleGoClick = () => {
        const newDates = generateDates(startDate, endDate);
        setDates(newDates);
    };

    // Khi `dates` thay đổi, hiển thị bảng
    useEffect(() => {
        if (dates.length > 0) {
            setShowTable(true);
        }
    }, [dates]);

    useEffect(() => {
        if (!socket.connected) {
            console.warn(" WebSocket chưa kết nối. Đang chờ...");
        }

        socket.emit("join_role", "Admin");

        socket.on("receive_notification", async (data) => {
            console.log(" Nhận thông báo mới:", data);

            // Add timestamp to notification
            const notificationWithTimestamp = {
                ...data,
                timestamp: new Date().toISOString(),
                isRead: false
            };

            // Update both state and localStorage
            const updatedNotifications = [...notificationsRef.current, notificationWithTimestamp];
            notificationsRef.current = updatedNotifications;
            setNotifications(updatedNotifications);
            saveNotificationsToStorage(updatedNotifications);

            // Update unread count
            const newUnreadCount = unreadCount + 1;
            setUnreadCount(newUnreadCount);
            saveUnreadCount(newUnreadCount);

            // Fetch updated data when receiving new notification
            await fetchUpdatedData();
        });

        return () => {
            socket.off("receive_notification");
        };
    }, [selectedHotels, unreadCount]);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (showNotifications) {
            // Reset unread count when closing notifications
            setUnreadCount(0);
            saveUnreadCount(0);

            // Mark all notifications as read
            const updatedNotifications = notifications.map(noti => ({
                ...noti,
                isRead: true
            }));
            setNotifications(updatedNotifications);
            notificationsRef.current = updatedNotifications;
            saveNotificationsToStorage(updatedNotifications);
        }
    };

    const isNewNotification = (timestamp) => {
        const notificationTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        return currentTime - notificationTime < oneHour;
    };

    // Thêm hàm xử lý click vào thông báo
    const handleNotificationClick = async (noti) => {
        const message = noti.message;
        console.log("Message from notification:", message);

        // Tìm room ID từ message (hỗ trợ cả 2 format: "id room" và "roomId")
        const roomIdMatch = message.match(/(?:id room|roomId)\s*([a-f0-9]+)/i);
        if (roomIdMatch && roomIdMatch[1]) {
            const roomId = roomIdMatch[1];
            console.log("Found room ID:", roomId);

            try {
                // Lấy thông tin phòng để tìm hotel ID
                const roomResponse = await getAllHotelSevices.getHotelByRoomId(roomId);
                console.log("Room response:", roomResponse);

                if (roomResponse && roomResponse.data) {
                    const hotelId = roomResponse.data._id; // Lấy _id của hotel
                    console.log("Found hotel ID:", hotelId);

                    // Nếu khác hotel hiện tại thì chuyển
                    if (hotelId !== selectedHotels) {
                        console.log("Switching to hotel:", hotelId);
                        setSelectedHotels(hotelId);

                        // Fetch dữ liệu cho hotel mới
                        const [bookingsResponse, roomsResponse] = await Promise.all([
                            getAllBooking.getAllBookingsByHotelId(hotelId),
                            getAllRoomAndTypeRoom.getAllRoomByHotelId(hotelId)
                        ]);

                        if (bookingsResponse && Array.isArray(bookingsResponse)) {
                            setBookings(bookingsResponse);
                        }

                        if (roomsResponse?.status === "OK") {
                            setRooms(roomsResponse.data);
                        }
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin phòng:", error);
            }
        }

        // Tiếp tục xử lý tìm phòng và highlight như cũ
        const roomMatch = message.match(/phòng\s+([A-Za-z0-9\s]+)/i);
        const dateMatches = message.match(/(\d{4}-\d{2}-\d{2})/g);

        if (roomMatch && dateMatches && dateMatches.length >= 2) {
            const roomName = roomMatch[1].trim();
            const checkinDate = dateMatches[0];
            const checkoutDate = dateMatches[1];

            console.log("Extracted room name:", roomName);
            console.log("Extracted check-in date:", checkinDate);
            console.log("Extracted check-out date:", checkoutDate);

            // Chuyển đổi định dạng ngày từ YYYY-MM-DD sang DD/MM/YYYY
            const formatDateForComparison = (dateStr) => {
                const [year, month, day] = dateStr.split('-');
                return `${day}/${month}/${year}`;
            };

            const formattedCheckinDate = formatDateForComparison(checkinDate);
            const formattedCheckoutDate = formatDateForComparison(checkoutDate);

            console.log("Formatted check-in date:", formattedCheckinDate);
            console.log("Formatted check-out date:", formattedCheckoutDate);

            // Tìm index của ngày check-in và check-out trong mảng dates
            let checkinIndex = dates.findIndex(date => {
                const currentDateStr = formatDateVN(date);
                console.log("Comparing check-in date:", currentDateStr, "with:", formattedCheckinDate);
                return currentDateStr === formattedCheckinDate;
            });

            let checkoutIndex = dates.findIndex(date => {
                const currentDateStr = formatDateVN(date);
                console.log("Comparing check-out date:", currentDateStr, "with:", formattedCheckoutDate);
                return currentDateStr === formattedCheckoutDate;
            });

            // Nếu không tìm thấy ngày trong tuần hiện tại, cập nhật bảng với tuần mới
            if (checkinIndex === -1 || checkoutIndex === -1) {
                console.log("Dates not found in current week, updating table...");

                // Tính toán khoảng thời gian để hiển thị ít nhất 7 ngày
                const startDateObj = new Date(checkinDate);
                const endDateObj = new Date(checkoutDate);
                const daysDiff = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));

                // Nếu khoảng thời gian nhỏ hơn 7 ngày, mở rộng ra
                if (daysDiff < 7) {
                    // Thêm ngày vào cuối để đủ 7 ngày
                    const daysToAdd = 7 - daysDiff;
                    endDateObj.setDate(endDateObj.getDate() + daysToAdd);
                }

                // Cập nhật startDate và endDate
                setStartDate(startDateObj.toISOString().split("T")[0]);
                setEndDate(endDateObj.toISOString().split("T")[0]);

                // Tạo mảng dates mới
                const newDates = generateDates(startDateObj, endDateObj);
                setDates(newDates);

                // Cập nhật lại indices
                checkinIndex = newDates.findIndex(date =>
                    formatDateVN(date) === formattedCheckinDate
                );
                checkoutIndex = newDates.findIndex(date =>
                    formatDateVN(date) === formattedCheckoutDate
                );
            }

            console.log("Found check-in index:", checkinIndex);
            console.log("Found check-out index:", checkoutIndex);

            if (checkinIndex !== -1 && checkoutIndex !== -1) {
                const roomsToHighlight = [];
                const groupedRooms = groupRoomsByType();

                console.log("All grouped rooms:", JSON.stringify(groupedRooms, null, 2));

                // In ra danh sách tất cả các phòng để debug
                groupedRooms.forEach(category => {
                    console.log("Category:", category.category);
                    category.rooms.forEach(room => {
                        console.log("Room in category:", room.name);
                    });
                });

                groupedRooms.forEach(category => {
                    category.rooms.forEach(room => {
                        console.log("Comparing room:", room.name, "with:", roomName);
                        // Chỉ lấy phần số của tên phòng để so sánh (ví dụ: R130 -> 130)
                        const roomNumber = room.name.match(/\d+/)?.[0];
                        const targetNumber = roomName.match(/\d+/)?.[0];
                        console.log("Comparing room numbers:", roomNumber, "vs", targetNumber);

                        if (roomNumber && targetNumber && roomNumber === targetNumber) {
                            console.log("Found matching room:", room.name);
                            // Highlight tất cả các ngày từ check-in đến check-out
                            for (let i = checkinIndex; i <= checkoutIndex; i++) {
                                roomsToHighlight.push({
                                    roomName: room.name,
                                    dateIndex: i
                                });
                            }
                        }
                    });
                });

                console.log("Final rooms to highlight:", roomsToHighlight);

                if (roomsToHighlight.length > 0) {
                    setHighlightedCells(roomsToHighlight);

                    // Scroll to table with a slight delay to ensure the state is updated
                    setTimeout(() => {
                        const tableElement = document.querySelector('.overflow-x-auto');
                        if (tableElement) {
                            tableElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            console.log("Scrolled to table");
                        } else {
                            console.log("Table element not found");
                        }
                    }, 100);
                } else {
                    console.log("No matching rooms found to highlight");
                }
            } else {
                console.log("Could not find matching dates in the current week");
            }
        } else {
            console.log("Could not extract room name or dates from message");
        }
    };

    // Thêm useEffect để reset highlighted cells sau 3 giây
    useEffect(() => {
        if (highlightedCells.length > 0) {
            const timer = setTimeout(() => {
                setHighlightedCells([]);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [highlightedCells]);

    return (
        <div>
            <div className="notification-container" style={{ position: 'relative', display: 'inline-block', float: 'right', marginRight: '150px', marginTop: '-85px' }}>
                <div
                    className="notification-bell"
                    onClick={toggleNotifications}
                    style={{
                        cursor: 'pointer',
                        position: 'relative',
                        fontSize: '28px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '50%',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '50px',
                        height: '50px',
                        margin: '10px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.backgroundColor = '#e9ecef';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                >
                    🔔
                    {unreadCount > 0 && (
                        <span
                            style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '2px 6px',
                                fontSize: '12px',
                                minWidth: '20px',
                                height: '20px',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                animation: 'pulse 2s infinite'
                            }}
                        >
                            {unreadCount}
                        </span>
                    )}
                </div>

                {showNotifications && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: '0',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            maxHeight: '600px',
                            overflowY: 'auto',
                            width: '500px',
                            padding: '20px',
                            marginTop: '10px'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            paddingBottom: '15px',
                            borderBottom: '2px solid #f0f0f0'
                        }}>
                            <h3 style={{ margin: 0, color: '#333', fontSize: '18px' }}>Thông báo đặt phòng</h3>
                            {unreadCount > 0 && (
                                <span style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '14px'
                                }}>
                                    {unreadCount} mới
                                </span>
                            )}
                        </div>
                        {notifications.length > 0 ? (
                            [...notifications]
                                .sort((a, b) => {
                                    // Sắp xếp theo thời gian mới nhất
                                    return new Date(b.timestamp) - new Date(a.timestamp);
                                })
                                .map((noti, index) => {
                                    const isUnread = !noti.isRead;
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                padding: '15px',
                                                borderBottom: '1px solid #eee',
                                                fontSize: '15px',
                                                backgroundColor: isUnread ? '#f8f9fa' : 'transparent',
                                                borderRadius: '8px',
                                                marginBottom: '10px',
                                                transition: 'all 0.3s ease',
                                                borderLeft: isUnread ? '4px solid #dc3545' : '4px solid #28a745',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleNotificationClick(noti)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#e9ecef';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = isUnread ? '#f8f9fa' : 'transparent';
                                            }}
                                        >
                                            <div style={{
                                                fontWeight: isUnread ? 'bold' : 'normal',
                                                color: isUnread ? '#dc3545' : '#28a745',
                                                fontSize: isUnread ? '16px' : '15px'
                                            }}>
                                                {isUnread && (
                                                    <span style={{
                                                        marginRight: '8px',
                                                        color: '#dc3545',
                                                        fontSize: '14px'
                                                    }}>●</span>
                                                )}
                                                {noti.message.replace(/(?:id room|roomId)\s*[a-f0-9]+/i, '')}
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: isUnread ? '#dc3545' : '#28a745',
                                                marginTop: '6px'
                                            }}>
                                                {new Date(noti.timestamp).toLocaleString('vi-VN')}
                                            </div>
                                        </div>
                                    );
                                })
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '30px',
                                color: '#6c757d',
                                fontSize: '15px'
                            }}>
                                ⏳ Không có thông báo mới
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add CSS animation for the notification badge */}
            <style>
                {`
                    @keyframes pulse {
                        0% {
                            transform: scale(1);
                        }
                        50% {
                            transform: scale(1.1);
                        }
                        100% {
                            transform: scale(1);
                        }
                    }
                `}
            </style>

            <div className="p-5">
                <div style={{ marginTop: "30px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px" }}>
                    <label style={{ fontSize: "20px" }}>Choose Hotel</label>
                    <select
                        className="form-select"
                        value={selectedHotels}
                        onChange={(e) => setSelectedHotels(e.target.value)}
                        style={{ width: "auto", minWidth: "200px" }} // Điều chỉnh kích thước select nếu cần
                    >
                        {hotels.map((h) => (
                            <option key={h._id} value={h._id}>
                                {h.NameHotel}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4 mb-4 items-center">
                    <label className="font-bold">From:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2" />
                    <label className="font-bold">To:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2" />
                    <button
                        onClick={handleGoClick}
                        style={{
                            padding: "8px 20px",
                            marginLeft: "10px",
                            fontSize: "16px",
                            backgroundColor: "#79D7BE",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            transition: "background-color 0.3s"
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = "#66C6A1")}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = "#79D7BE")}
                    >
                        GO
                    </button>

                </div>

                {showTable && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2" style={{ textAlign: 'center' }}>Room Type</th>
                                    {dates.map((date, index) => (
                                        <th
                                            key={index}
                                            className="border px-4 py-2"
                                            style={{ textAlign: 'center', fontWeight: 'bold' }}
                                        >
                                            {getDayOfWeek(date)}<br />{formatDateVN(date)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {groupRoomsByType().map((category) => (
                                    <React.Fragment key={category.category}>
                                        <tr className="bg-gray-200">
                                            <td colSpan={dates.length + 1} className="px-4 py-2 font-bold" style={{ backgroundColor: '#f3f3f3' }}>
                                                {category.category}
                                            </td>
                                        </tr>
                                        {category.rooms.map((room) => (
                                            <tr key={room.name}>
                                                <td className="border px-4 py-2" style={{ fontWeight: 'bold' }}>{room.name}</td>
                                                {room.status.map((status, index) => (
                                                    <td
                                                        key={index}
                                                        className="border px-4 py-2"
                                                        style={{
                                                            backgroundColor:
                                                                highlightedCells.some(cell =>
                                                                    cell.roomName === room.name && cell.dateIndex === index
                                                                )
                                                                    ? "#ffa500" // Màu cam cho ô được highlight
                                                                    : status === "Available"
                                                                        ? "#d4edda"
                                                                        : status === "Pending"
                                                                            ? "#fff3cd"
                                                                            : "#f8d7da",
                                                            color:
                                                                highlightedCells.some(cell =>
                                                                    cell.roomName === room.name && cell.dateIndex === index
                                                                )
                                                                    ? "#000000" // Chữ đen cho ô được highlight
                                                                    : status === "Available"
                                                                        ? "#155724"
                                                                        : status === "Pending"
                                                                            ? "#856404"
                                                                            : "#721c24",
                                                            textAlign: "center",
                                                            fontWeight: "bold",
                                                            transition: "background-color 0.3s ease",
                                                            position: "relative",
                                                            zIndex: highlightedCells.some(cell =>
                                                                cell.roomName === room.name && cell.dateIndex === index
                                                            ) ? 1 : 0
                                                        }}
                                                    >
                                                        {status === "Available"
                                                            ? "Available"
                                                            : status === "Pending"
                                                                ? "Pending"
                                                                : "Booked"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>

                    </div>
                )}
            </div>
        </div>
    );
};
export default BookingLog;
