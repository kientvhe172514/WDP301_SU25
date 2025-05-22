import axios from "axios";

// Create an axios instance for JWT requests (if necessary)
export const axiosJWT = axios.create();

export const getAllServices = async () => {
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/services`);
        return res.data;
    } catch (error) {
        console.error("Error in getAllServices:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to fetch services" };
    }
};

export const getServiceDetails = async (id, access_token) => {
    try {
        const res = await axiosJWT.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/services/${id}`,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("Error in getServiceDetails:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to fetch service details" };
    }
};

export const createService = async (data, access_token) => {
    try {
        const res = await axiosJWT.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/services`,
            data,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("Error in createService:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to create service" };
    }
};

export const updateService = async (id, data, access_token) => {
    try {
        const res = await axiosJWT.put(
            `${process.env.REACT_APP_API_URL_BACKEND}/services/${id}`,
            data,
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("Error in updateService:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to update service" };
    }
};

export const deleteService = async (id, access_token) => {
    try {
        const res = await axiosJWT.delete(
            `${process.env.REACT_APP_API_URL_BACKEND}/services/${id}`,
            {
                headers: { Authorization: `Bearer ${access_token}` },
            }
        );
        return res.data;
    } catch (error) {
        console.error("Error deleting service:", error);
        return {
            status: "ERR",
            message: error.response?.data?.message || "Failed to delete service"
        };
    }
};
