import axios from "axios";

export const getAllRoom = async (data) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/rooms`,
        data

    );
    // console.log("res getAllRoom:", res);
    return res.data;
};

export const getAllTypeRoom = async (data) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/rooms/get-all-typeroom`,
        data

    );
    // console.log("getAllTypeRoom", res);
    return res.data;
};

export const getRoomById = async (id) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/rooms/${id}`
    );
    // console.log("res getRoomById:", res);
    return res.data;
};

export const createRoom = async (data) => {
    console.log("data createRoom:", data);
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/rooms`,
        data
    );
    console.log("res createrooms:", res);
    return res.data;
};

export const updateRoom = async (id, data) => {
    const res = await axios.put(
        `${process.env.REACT_APP_API_URL_BACKEND}/rooms/${id}`,
        data,
        // {
        //     headers: {
        //         token: `Bearer: ${access_token}`,
        //     },
        // }
    );
    console.log("Update API Response:", res.data)
    return res.data;
};

export const deleteRoom = async (id, access_token) => {
    const res = await axios.delete(
        `${process.env.REACT_APP_API_URL_BACKEND}/rooms/${id}`,
        // {
        //     headers: {
        //         token: `Bearer: ${access_token}`,
        //     },
        // }
    );
    console.log("res deleteRoom:", res);
    return res.data;
};

export const deleteManyProduct = async (iddata, access_token) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/product/delete-many-product`,
        iddata,
        {
            headers: {
                token: `Bearer: ${access_token}`,
            },
        }
    );
    return res.data;
};

export const getAllRoomType = async () => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/roomtype`
    );
    // console.log("res getAllRoomType:", res);
    return res.data;
};

export const getRoomsGroupedByType = async (data) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/rooms/by-type`, data
    );
    console.log("res getRoomsGroupedByType:", res);
    return res.data;
};

export const getAllRoomAmenities = async () => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/rooms-amenities`
    );
    console.log("res getAllRoomAmenities:", res);
    return res.data;
};


export const getAvailableRooms = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/rooms/getavail`);
        return response.data; // Return the available rooms data
    } catch (error) {
        console.error("Error fetching available rooms:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to fetch available rooms" };
    }
};

export const checkRoomAvailability = async (startDate, endDate, hotelId) => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/rooms/availability`,
            {
                params: {
                    startDate,
                    endDate,
                    hotelId
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error checking room availability:", error);
        throw error;
    }
};
//


// export const getAllRoom2 = async (data) => {
//     const res = await axios.get(
//         `${process.env.REACT_APP_API_URL_BACKEND}/rooms`,
//         data

//     );
//     console.log("data", data);
//     return res.data;
// };
export const getAllRoomByHotelId = async (id) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/rooms/hotel/${id}`
    );
    return res.data;
};