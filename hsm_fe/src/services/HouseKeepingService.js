import axios from "axios";


export const getRoomsByAccount = async (accountId) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/rooms/account/${accountId}`
    );
    console.log("📌 API Response getRoomsByAccount:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi gọi API getRoomsByAccount:", error);
    return [];
  }
};


const API_URL = process.env.REACT_APP_API_URL_BACKEND + "/housekeeping";


export const createHousekeepingTask = async (roomId, assignedTo, taskType, notes) => {
  return axios.post(`${API_URL}/create`, { roomId, assignedTo, taskType, notes });
};




export const updateHousekeepingTask = async (taskId, status, cancelNotes) => {
  console.log("🔍 Debug FE API call: Task ID:", taskId, "Status:", status, "Notes:", cancelNotes);

  if (status === "Cancelled") {
    return axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/housekeeping/edit/${taskId}`, {
      status,
      notes: cancelNotes
    });
  } else {
    return axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/housekeeping/edit/${taskId}`, {
      status
    });
  }
};




export const cancelHousekeepingTask = async (taskId) => {
  return axios.put(`${API_URL}/cancle/${taskId}`);
};




export const getDirtyRooms = async () => {
  return axios.get(`${API_URL}/dirty-rooms`);
};




export const getHousekeepingLogs = async (roomId) => {
  return axios.get(`${API_URL}/logs/${roomId}`);
};




export const updateRoomCleaningStatus = async (roomId, status, notes) => {
  return axios.put(`${API_URL}/cleaning-status/${roomId}`, { status, notes });
};


export const getHousekeepingTasks = async (filter = {}) => {
  return axios.get(`${API_URL}/list`, { params: filter });
};


