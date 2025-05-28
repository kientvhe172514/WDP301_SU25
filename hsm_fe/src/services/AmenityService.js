import axios from "axios";

export const getAllAmenities = async (includeDeleted = false) => {
  const res = await axios.get(`/api/amenities`);
  console.log("res getAllAmenities:", res);
  return res.data;
};

export const getAmenityById = async (id) => {
  const res = await axios.get(`/api/amenities/${id}`);
  console.log("res getById:", res);
  return res.data;
};

export const createAmenity = async (data) => {
  try {
    const res = await axios.post(`/api/amenities`, data);
    return res.data;
  } catch (error) {
    console.error("Error in createAmenity:", error.response?.data || error);
    if (error.response?.data) {
      return error.response.data;
    }

    return {
      status: "ERROR",
      message: error.message || "Failed to create amenity",
    };
  }
};

export const updateAmenity = async (id, data) => {
  const res = await axios.put(`/api/amenities/${id}`, data);
  console.log("res updateAmenity:", res);
  return res.data;
};

export const deleteAmenity = async (id) => {
  const res = await axios.delete(`/api/amenities/${id}`);
  console.log("res deleteAmenity:", res);
  return res.data;
};

export const importAmenities = async (formData) => {
  const res = await axios.post("/api/amenities/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const previewAmenities = async (formData) => {
  const res = await axios.post("/api/amenities/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
