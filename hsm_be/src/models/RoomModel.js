const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        RoomName: { type: String, required: true, trim: true },
        Price: { type: Number, required: true, min: 0 },
        Status: {
            type: String,
            enum: ["Available", "Available - Need Cleaning", "Available - Cleaning"],
            default: "Available",
        },
        Floor: { type: Number, required: true },
        roomtype: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RoomType",
            required: true,
        },
        hotel: { type: mongoose.Schema.Types.ObjectId, ref: "hotels", },
        Description: { type: String, trim: true },
        Image: {
            type: String,
            trim: true,
        },
        IsDelete: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;