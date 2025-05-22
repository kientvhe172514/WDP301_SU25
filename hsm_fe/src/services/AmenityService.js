import axios from "axios";

export const getAllAmenities = async (includeDeleted = false) => {
    const res = await axios.get(
        `/api/amenities${includeDeleted ? '?includeDeleted=true' : ''}`
    );
    console.log("res getAllAmenities:", res);
    return res.data;
};

export const getAmenityById = async (id) => {
    const res = await axios.get(
        `/api/amenities/${id}`
    );
    console.log("res getById:", res);
    return res.data;
};

export const createAmenity = async (data) => {
    console.log("data createAmenity:", data);
    const res = await axios.post(
        `/api/amenities`,
        data
    );
    console.log("res createAmenity:", res);
    return res.data;
};

export const updateAmenity = async (id, data) => {
    const res = await axios.put(
        `/api/amenities/${id}`,
        data
    );
    console.log("res updateAmenity:", res);
    return res.data;
};

export const deleteAmenity = async (id) => {
    const res = await axios.delete(
        `/api/amenities/${id}`
    );
    console.log("res deleteAmenity:", res);
    return res.data;
};

export const softDeleteAmenity = async (id) => {
    const res = await axios.delete(`/api/amenities/${id}/soft`);
    return res.data;
};
