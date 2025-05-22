const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema(
    {
        TypeName: { type: String, required: true, trim: true },
        Note: { type: String, required: true, trim: true }
    },
    {
        timestamps: true,
    }
);

const RoomType = mongoose.model("RoomType", roomTypeSchema);

module.exports = RoomType;
