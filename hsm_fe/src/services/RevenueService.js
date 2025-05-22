import axios from 'axios';

export const getRevenueData = async (employeeId, timeRange, startDate, endDate) => {
    try {
        const params = {
            timeRange,
            ...(startDate && endDate ? { startDate, endDate } : {})
        };

        const response = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/revenue/${employeeId}`,
            { params }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        return {
            status: 'ERR',
            message: error.response?.data?.message || 'Failed to fetch revenue data'
        };
    }
}; 