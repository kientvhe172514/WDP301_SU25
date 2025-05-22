import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL_BACKEND,
    withCredentials: true, // Important: enables sending cookies with requests
    headers: {
        'Content-Type': 'application/json',
    }
});

export default axiosInstance; 