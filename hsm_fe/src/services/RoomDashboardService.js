import axios from "axios";

const getRoomDashboardData = async (hotelId, startDate, endDate) => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/rooms/dashboard/data`,
            {
                params: {
                    hotelId,
                    startDate,
                    endDate
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return {
            status: "ERR",
            data: {
                rooms: [],
                stats: {
                    total: 0,
                    available: 0,
                    occupied: 0,
                    maintenance: 0,
                    cleaning: 0
                }
            }
        };
    }
};

const getRoomBookingStatus = async (roomId, startDate, endDate) => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/bookings/date-range?startDate=${startDate}&endDate=${endDate}`
        );

        const bookings = response.data.data;
        const roomBookings = bookings
            .filter(booking => booking.rooms._id === roomId)
            .map(booking => ({
                checkIn: booking.Time.Checkin,
                checkOut: booking.Time.Checkout,
                guestName: booking.customers.full_name,
                status: booking.Status
            }));

        return {
            status: "OK",
            data: roomBookings
        };
    } catch (error) {
        console.error('Error fetching room booking status:', error);
        throw error;
    }
};

export {
    getRoomDashboardData,
    getRoomBookingStatus
}; 