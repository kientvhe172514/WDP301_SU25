import axios from "axios";

export const getAllRoomAmenities = async () => {
    try {
        const res = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/roomamenities`
        );
        return res.data;
    } catch (error) {
        console.error("Error fetching all room amenities:", error);
        throw error;
    }
};

export const getRoomAmenityById = async (id) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/roomamenities/${id}`
    );
    console.log("res getRoomById:", res);
    return res.data;
};

export const createRoomAmenity = async (data) => {
    console.log("data createRoomAmenity:", data);
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/roomamenities`,
        data
    );
    console.log("res createRoomAmenity:", res);
    return res.data;
};

export const updateRoomAmenity = async (id, access_token, data) => {
    const res = await axios.put(
        `${process.env.REACT_APP_API_URL_BACKEND}/roomamenities/${id}`,
        data,
        // {
        //     headers: {
        //         token: `Bearer: ${access_token}`,
        //     },
        // }
    );
    console.log("res updateRoomAmenity:", res);
    return res.data;
};

export const deleteRoomAmenity = async (id, access_token) => {
    const res = await axios.delete(
        `${process.env.REACT_APP_API_URL_BACKEND}/roomamenities/${id}`,
        // {
        //     headers: {
        //         token: `Bearer: ${access_token}`,
        //     },
        // }
    );
    console.log("res deleteRoomAmenity:", res);
    return res.data;
};

export const getAmenitiesByRoomId = async (roomId) => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/roomamenities/${roomId}/amenities`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching room amenities:", error);
        throw error;
    }
};

export const updateRoomAmenitiesByRoomId = async (roomId, amenities) => {
    const res = await axios.put(
        `${process.env.REACT_APP_API_URL_BACKEND}/roomamenities/${roomId}/amenities`,
        { room_amenities: amenities },
        // {
        //     headers: {
        //         token: `Bearer: ${access_token}`,
        //     },
        // }
    );
    return res.data;
};

export const updateRoomAmenities = async (roomId, amenities) => {
    try {
        const response = await axios.put(
            `${process.env.REACT_APP_API_URL_BACKEND}/roomamenities/${roomId}/amenities`,
            { amenities }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating room amenities:", error);
        throw error;
    }
};