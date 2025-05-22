const mongoose = require("mongoose");

const amenitiesSchema = new mongoose.Schema(
    {
        AmenitiesName: { type: String, required: true, trim: true },
        Quality: { type: Number, required: true, min: 1 },
        Status: { type: String, enum: ["Hoạt động", "Hỏng", "Đang sửa chữa"], default: "Hoạt động" },
        Note: { type: String, trim: true }
    },
    {
        timestamps: true,
    }
);

const Amenity = mongoose.model("amenites", amenitiesSchema);

module.exports = Amenity;
