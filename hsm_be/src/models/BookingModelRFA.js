const mongoose = require("mongoose");
const Room = require("../models/RoomModel");
const bookingSchema = new mongoose.Schema(
    {
        customers: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
        rooms: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
        Time: {
            Checkin: { type: Date, required: true },
            Checkout: { type: Date, required: true },
        },
        SumPrice: { type: Number, required: true },
        Status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], required: true },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
