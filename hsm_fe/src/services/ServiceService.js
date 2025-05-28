import axios from "axios";

// Create an axios instance for JWT requests (if necessary)
export const axiosJWT = axios.create();

export const getAllServices = async () => {
  try {
    const res = await axios.get(`/api/services`);
    return res.data;
  } catch (error) {
    console.error("Error in getAllServices:", error);
    return {
      status: "ERR",
      message: error.response?.data?.message || "Failed to fetch services",
    };
  }
};

export const getServiceDetails = async (id, access_token) => {
  try {
    const res = await axiosJWT.get(`/api/services/${id}`, {
      // headers: {
      //   token: `Bearer ${access_token}`,
      // },
    });
    return res.data;
  } catch (error) {
    console.error("Error in getServiceDetails:", error);
    return {
      status: "ERR",
      message:
        error.response?.data?.message || "Failed to fetch service details",
    };
  }
};

export const createService = async (data, access_token) => {
  try {
    const res = await axios.post(`/api/services`, data, {
      // headers: {
      //   token: `Bearer ${access_token}`,
      // },
    });
    return res.data;
  } catch (error) {
    console.error("Error in createService:", error);
    return {
      status: "ERR",
      message: error.response?.data?.message || "Failed to create service",
    };
  }
};

export const updateService = async (id, data, access_token) => {
  try {
    const res = await axiosJWT.put(`/api/services/${id}`, data, {
      // headers: {
      //   token: `Bearer ${access_token}`,
      // },
    });
    return res.data;
  } catch (error) {
    console.error("Error in updateService:", error);
    return {
      status: "ERR",
      message: error.response?.data?.message || "Failed to update service",
    };
  }
};

export const deleteService = async (id, access_token) => {
  try {
    const res = await axiosJWT.delete(`/api/services/${id}`, {
      // headers: { Authorization: `Bearer ${access_token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting service:", error);
    return {
      status: "ERR",
      message: error.response?.data?.message || "Failed to delete service",
    };
  }
};

export const importServicesFromExcel = async (formData) => {
  const res = await axios.post("/api/services/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const previewServicesFromExcel = async (formData) => {
  const res = await axios.post("/api/services/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
