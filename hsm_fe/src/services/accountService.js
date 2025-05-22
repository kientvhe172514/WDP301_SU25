import axios from "axios";

const axiosInstance = axios.create({
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

export const axiosJWT = axios.create();

export const silentRefresh = async () => {
    try {
        console.log("Attempting silent refresh..."); // Debug log
        const res = await axios.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/account/refresh-token`,
            {},
            {
                withCredentials: true // Important: allows cookies to be sent
            }
        );
        console.log("Silent refresh response:", res.data); // Debug log
        return res.data;
    } catch (error) {
        console.error("Silent refresh error:", {
            status: error.response?.status,
            message: error.response?.data?.message,
            error: error.message
        }); // Detailed error logging
        throw error;
    }
};

export const loginAccount = async (data) => {
    const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/account/login`,
        data
    );
    if (res.data?.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
    }
    return res.data;
};

export const createAccount = async (data) => {
    try {
        const res = await axios.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/account/create`,
            data
        );
        return res.data;
    } catch (error) {
        return { status: "ERR", message: error.response?.data?.message };
    }
};
export const createProduct = async (data) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/account/create`,
        data
    );
    return res.data;
};

export const getDetailsAccount = async (id, access_token) => {
    const res = await axiosJWT.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/account/${id}`,
        {
            headers: {
                token: `Bearer ${access_token}`,
            },
        }
    );
    return res.data;
};

export const refreshToken = async () => {
    try {
        const res = await axios.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/account/refresh-token`,
            {}, // Empty body as refresh token is in HTTP-only cookie
            { withCredentials: true } // Important: allows cookies to be sent
        );
        if (res.data?.access_token) {
            localStorage.setItem("access_token", res.data.access_token);
        }
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const getEmployeeByAccountId = async (id, access_token) => {
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/employee/account/${id}`, {
            headers: {
                token: `Bearer ${access_token}`,
            }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching employee details:", error);
        return null;
    }
};

export const logout = async (access_token) => {
    try {
        const res = await axiosJWT.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/account/logout`,
            {},
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
                withCredentials: true // Important: allows cookies to be cleared
            }
        );

        // Clear local storage
        localStorage.removeItem("access_token");

        return res.data;
    } catch (error) {
        console.error("Logout error:", error);
        // Still clear local storage even if server request fails
        localStorage.removeItem("access_token");
        return { status: "ERR", message: error.response?.data?.message };
    }
};
