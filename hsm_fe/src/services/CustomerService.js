import axios from "axios";

// Create an axios instance for JWT requests (if necessary)
export const axiosJWT = axios.create();

export const checkCustomerExists = async (phone, cccd) => {
    try {
        const res = await axios.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/customers/check-exists`,
            { phone, cccd }
        );
        return res.data;
    } catch (error) {
        console.error("Error in checkCustomerExists:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to check customer" };
    }
};

export const createCustomer = async (data) => {
    try {
        const res = await axios.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/customers`,
            data
        );
        return res.data;
    } catch (error) {
        console.error("Error in createCustomer:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to create customer" };
    }
};

export const getCustomerDetails = async (id, access_token) => {
    try {
        const res = await axiosJWT.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/customers/${id}`,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("Error in getCustomerDetails:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to fetch customer details" };
    }
};

export const updateCustomer = async (id, data, access_token) => {
    try {
        const res = await axiosJWT.put(
            `${process.env.REACT_APP_API_URL_BACKEND}/customers/${id}`,
            data,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("Error in updateCustomer:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to update customer" };
    }
};
