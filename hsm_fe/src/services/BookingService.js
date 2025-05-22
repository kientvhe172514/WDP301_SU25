import axios from "axios";

export const getAllBookings = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/bookings`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to fetch bookings" };
    }
};

export const getBookingsByDateRange = async (startDate, endDate) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/bookings/date-range`, {
            params: {
                startDate,
                endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching bookings by date range:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to fetch bookings" };
    }
};

export const createBooking = async (bookingData) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/bookings`, bookingData);
        return response.data;
    } catch (error) {
        console.error("Error creating booking:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to create booking" };
    }
};

export const updateBooking = async (id, bookingData) => {
    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/bookings/${id}`, bookingData);
        return response.data;
    } catch (error) {
        console.error("Error updating booking:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to update booking" };
    }
};

export const deleteBooking = async (id) => {
    try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL_BACKEND}/bookings/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting booking:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to delete booking" };
    }
};

//
// export const getAllBooking = async (data) => {
//     try {
//         const res = await axios.get(
//             `${process.env.REACT_APP_API_URL_BACKEND}/booking/get-all-booking`,
//             data
//         );
//         return res.data;
//     } catch (error) {
//         return { status: "ERR", message: error.response?.data?.message };
//     }
// };

export const getAllBookingsByHotelId = async (hotelId) => {
    try {
        const res = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/bookings/hotel/${hotelId}`
        );
        console.log("Data từ API:", res.data);
        return res.data;  // Thêm dòng này
    } catch (error) {
        console.error("Lỗi khi gọi API:", error.response?.data || error.message);
        return null; // Trả về null nếu có lỗi
    }
};