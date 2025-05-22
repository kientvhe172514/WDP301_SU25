import axios from "axios";

export const getAllHotel = async (data) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/hotel`,
        data
    );
    // console.log("res getAllHotel:", res);
    return res.data;
};

export const createHotel = async (data) => {
    const res = await axios.post(
        `${process.env.REACT_APP_API_URL_BACKEND}/hotel`,
        data

    );
    console.log("res createHotel:", res);
    return res.data;
};

export const getHotelById = async (id) => {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL_BACKEND}/hotel/${id}`
    );
    console.log("res get Hotel By Id:", res);
    return res.data;
};

export const updateHotel = async (id, data) => {
    const res = await axios.put(
        `${process.env.REACT_APP_API_URL_BACKEND}/hotel/${id}`,
        data,
        // {
        //     headers: {
        //         token: `Bearer: ${access_token}`,
        //     },
        // }
    );
    console.log("res updateHotel:", res);
    return res.data;
};

export const deleteHotel = async (id, access_token) => {
    const res = await axios.delete(
        `${process.env.REACT_APP_API_URL_BACKEND}/hotel/${id}`,
        // {
        //     headers: {
        //         token: `Bearer: ${access_token}`,
        //     },
        // }
    );
    console.log("res deleteRoom:", res);
    return res.data;
};


export const getHotelByRoomId = async (id) => {
    try {
        const res = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/hotel/by-room/${id}`
        );

        console.log("Hotel data:", res.data);
        return res.data;
    } catch (error) {
        console.error("Lỗi khi lấy khách sạn theo roomId:", error);
        throw error;
    }
};