const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
    {
        CodeHotel: {
            type: String, required: true, unique: true, trim: true,
        },
        NameHotel: {
            type: String, required: true, trim: true,
        },
        Introduce: {
            type: String, trim: true,
        },
        LocationHotel: {
            type: String, required: true, trim: true,
        },
        image: {
            type: String, trim: true,
        },
        Active: {
            type: Boolean, default: true,
        },
        IsDelete: {
            type: Boolean, default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Hotel = mongoose.model("hotels", hotelSchema);

module.exports = Hotel;
