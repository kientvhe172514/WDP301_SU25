import axios from "axios";

export const getDashboardData = async (employeeId) => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/dashboard/${employeeId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return {
            status: "ERR",
            message: error.response?.data?.message || "Failed to fetch dashboard data"
        };
    }
}; 