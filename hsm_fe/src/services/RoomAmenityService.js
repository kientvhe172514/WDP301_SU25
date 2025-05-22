import axios from "axios";

export const getRoomAmenities = async () => {
    const res = await axios.get(`/api/roomamenities`);
    console.log("getRoomAmenities", res)
    return res.data;
};

export const updateRoomAmenityStatus = async (id, data) => {
    const res = await axios.put(`/api/roomamenities/${id}`, data);
    return res.data;
};

export const getRoomAmenitiesByRoom = async (roomId) => {
    const res = await axios.get(`/api/roomamenities/room/${roomId}`);
    return res.data;
};

export const getRoomAmenitiesByAmenity = async (amenityId) => {
    const res = await axios.get(`/api/roomamenities/amenity/${amenityId}`);
    return res.data;
};