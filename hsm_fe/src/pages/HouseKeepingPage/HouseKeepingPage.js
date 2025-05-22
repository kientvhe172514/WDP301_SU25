import React, { useState, useEffect } from "react";
import { Card, message, Dropdown, Menu, Modal } from "antd";
import { ClearOutlined, MoreOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getRoomsByAccount,
  updateHousekeepingTask,
  getHousekeepingTasks,
} from "../../services/HouseKeepingService";
import axios from "axios";
import { useSelector } from "react-redux";
import TestNotification from "../HouseKeepingPage/TestNotification";

const Housekeeping = () => {
  const isRehydrated = useSelector((state) => state._persist?.rehydrated);
  const account = useSelector((state) => state.account);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);

  useEffect(() => {
    if (!isRehydrated) return; // Nếu Redux chưa rehydrate, không fetch dữ liệu

    if (!account || !account.id) {
      console.error("❌ Không tìm thấy accountId");
      return;
    }

    setCurrentEmployeeId(account.id);
    fetchRooms(account.id);
    fetchTasks();

    // Thiết lập polling mỗi 5 giây
    const interval = setInterval(() => {
      fetchRooms(account.id);
      fetchTasks();
    }, 100); // 5000ms = 5 giây, có thể điều chỉnh

    // Cleanup khi component unmount
    return () => clearInterval(interval);
  }, [isRehydrated, account]);

  const fetchTasks = async () => {
    try {
      const response = await getHousekeepingTasks();
      setTasks(response.data);
    } catch (error) {
      console.error("❌ Error fetching housekeeping tasks:", error);
      message.error("Failed to fetch housekeeping tasks");
    }
  };

  const fetchRooms = async (employeeId) => {
    try {
      if (!employeeId) {
        console.error("❌ Không tìm thấy accountId");
        return;
      }
      const response = await getRoomsByAccount(employeeId);

      console.log("📌 API Response getRoomsByAccount:", response);

      if (response.success && Array.isArray(response.data)) {
        const roomNames = response.data.flatMap((hotel) =>
          hotel.rooms.map((room) => ({
            id: room.id,
            name: room.name,
            status: room.status,
          }))
        );
        console.log("📌 Danh sách phòng sau khi xử lý:", roomNames);
        setRooms(roomNames);
      } else {
        console.error("❌ API không trả về dữ liệu hợp lệ");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách phòng:", error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Available - Need Cleaning":
        return {
          backgroundColor: "#333333",
          color: "white",
          position: "relative",
        };
      case "Available - Cleaning":
        return { backgroundColor: "#00CC00", color: "white" };
      default:
        return { backgroundColor: "#a0a0a0", color: "white" };
    }
  };

  const handleRoomClick = (room) => {
    if (room.status === "Available - Need Cleaning") {
      console.log("🏠 Phòng được chọn:", room);
      setSelectedRoom(room);
      setIsModalVisible(true);
    }
  };

  const confirmCleaning = async () => {
    if (!selectedRoom) {
      console.error("❌ Lỗi: Không tìm thấy phòng được chọn.");
      return;
    }
    setIsModalVisible(false);

    const persistedData = localStorage.getItem("persist:root");
    if (!persistedData) {
      console.error("Không tìm thấy dữ liệu tài khoản. Hãy đăng nhập lại.");
      toast.error("Account data not found.Please log in again.", { autoClose: 3000 });
      return;
    }

    try {
      const parsedData = JSON.parse(persistedData);
      const accountData = parsedData.account
        ? JSON.parse(parsedData.account)
        : null;
      const employeeId = accountData ? accountData.id : null;

      if (!employeeId) {
        toast.error("Không tìm thấy ID nhân viên. Hãy đăng nhập lại.", { autoClose: 3000 });
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/housekeeping/create`,
        {
          roomId: selectedRoom.id,
          assignedTo: employeeId,
          taskType: "Cleaning",
          notes: "",
          status: "In Progress",
        }
      );

      if (response.status === 201) {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === selectedRoom.id
              ? { ...room, status: "Available - Cleaning" }
              : room
          )
        );

        toast.success("Registration successful", { autoClose: 3000 });
      }
      // await fetchTasks();
      // await fetchRooms();
    } catch (error) {
      console.error("Lỗi khi tạo housekeeping task:", error);
      // ⚠️ Hiển thị cảnh báo khi nhân viên đã có task
      if (error.response && error.response.data) {
        toast.warning(error.response.data.message, { autoClose: 3000 });
      } else {
        toast.error("Failed to create housekeeping task", { autoClose: 3000 });
      }
    }
  };

  // Kiểm tra xem nhân viên hiện tại có phải là người được giao nhiệm vụ không
  const checkAssignmentPermission = (roomId) => {
    // Tìm task theo roomId
    const housekeepingTask = tasks.find(
      (task) => task.room._id === roomId && task.status === "In Progress"
    );

    if (!housekeepingTask) {
      return false;
    }

    // Kiểm tra xem nhân viên hiện tại có phải là người được giao nhiệm vụ không
    return housekeepingTask.assignedTo._id === currentEmployeeId;
  };

  const handleMenuClick = async ({ key }) => {
    if (!selectedRoom) return;

    try {
      console.log("🔍 Debug: Trạng thái cập nhật", key);

      // Tìm task theo roomId và status
      const housekeepingTask = tasks.find(
        (task) =>
          task.room._id === selectedRoom.id && task.status === "In Progress"
      );

      if (!housekeepingTask) {
        toast.error("Cleaning task not found.", { autoClose: 3000 });
        return;
      }

      // Kiểm tra quyền truy cập
      if (housekeepingTask.assignedTo._id !== currentEmployeeId) {
        toast.error("You are not the staff assigned to clean this room!", { autoClose: 3000 });
        return;
      }

      console.log("✅ Debug: Đã tìm thấy housekeepingTask:", housekeepingTask);
      console.log("🔍 Debug: Task ID:", housekeepingTask._id);

      if (key === "cleaned") {
        await updateHousekeepingTask(housekeepingTask._id, "Completed");
        toast.success("Room cleaned successfully", { autoClose: 3000 });
      } else if (key === "canceled") {
        const note = prompt("Reason for cancellation of room cleaning?");
        if (!note) {
          return;
        }

        await updateHousekeepingTask(housekeepingTask._id, "Cancelled", note);
        toast.warning("Room cleaning task canceled", { autoClose: 3000 });
      }

      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === selectedRoom.id
            ? {
              ...room,
              status:
                key === "cleaned" ? "Available" : "Available - Need Cleaning",
            }
            : room
        )
      );

      // await fetchTasks();
    } catch (error) {
      console.error("❌ Error updating room status:", error);
      message.error("Failed to update room status");
    }

    setSelectedRoom(null);
  };

  const handleMoreClick = (room, e) => {
    e.stopPropagation();

    // Kiểm tra quyền truy cập
    const hasPermission = checkAssignmentPermission(room.id);

    if (!hasPermission) {
      toast.error("Bạn không phải là nhân viên được giao nhiệm vụ dọn phòng này!", { autoClose: 3000 });
      return;
    }

    setSelectedRoom(room);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="cleaned">Cleaned</Menu.Item>
      <Menu.Item key="canceled">Canceled</Menu.Item>
    </Menu>
  );

  return (
    <div style={{ padding: "24px" }}>
      <ToastContainer />
      <h1
        style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}
      >
        Housekeeping Status
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "16px",
        }}
      >
        {rooms.map((room) => {
          // Tìm task có trạng thái "In Progress" của phòng hiện tại
          const cleaningTask = tasks.find(
            (task) => task.room._id === room.id && task.status === "In Progress"
          );

          // Kiểm tra quyền truy cập
          const hasPermission = cleaningTask && cleaningTask.assignedTo._id === currentEmployeeId;

          return (
            <Card
              key={room.id}
              style={{
                ...getStatusStyle(room.status),
                textAlign: "center",
                fontWeight: "bold",
                padding: "16px",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => handleRoomClick(room)}
            >
              {room.name}

              {/* Icon khi phòng cần dọn */}
              {room.status === "Available - Need Cleaning" && (
                <ClearOutlined
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "16px",
                    color: "white",
                  }}
                />
              )}

              {/* Hiển thị người đang dọn phòng */}
              {room.status === "Available - Cleaning" && (
                <>
                  <MoreOutlined
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      fontSize: "16px",
                      color: "white",
                      cursor: hasPermission ? "pointer" : "not-allowed",
                    }}
                    onClick={(e) => handleMoreClick(room, e)}
                  />

                  {/* Hiển thị dropdown chỉ khi có quyền truy cập */}
                  {selectedRoom && selectedRoom.id === room.id && hasPermission && (
                    <Dropdown
                      overlay={menu}
                      trigger={["click"]}
                      visible={selectedRoom && selectedRoom.id === room.id}
                      onVisibleChange={(visible) => !visible && setSelectedRoom(null)}
                    >
                      <span style={{ position: "absolute", top: "8px", right: "8px", width: "16px", height: "16px" }}></span>
                    </Dropdown>
                  )}

                  {/* Hiển thị tên nhân viên */}
                  {cleaningTask && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#fff",
                        marginBottom: "0",
                      }}
                    >
                      🧹 Đang dọn: <strong>{cleaningTask.assignedTo?.Username || "Không rõ"}</strong>
                    </p>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </div>

      <Modal
        title="Confirm information"
        open={isModalVisible}
        onOk={confirmCleaning}
        onCancel={() => setIsModalVisible(false)}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you signed up to clean this room?</p>
      </Modal>
      <div style={{ marginTop: "24px" }}>
        <h2 style={{ fontWeight: "bold" }}>Legend:</h2>
        <ul style={{ marginTop: "8px" }}>
          <li style={{ color: "#a0a0a0" }}> All Rooms (Default)</li>
          <li style={{ color: "#444444" }}>
            Available - Need Cleaning (With Broom Icon)
          </li>
          <li style={{ color: "#00CC00" }}> Available - Cleaning</li>
        </ul>
      </div>
      <TestNotification />
    </div>
  );
};

export default Housekeeping;