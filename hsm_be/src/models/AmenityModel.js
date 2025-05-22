const mongoose = require("mongoose");

const amenitySchema = new mongoose.Schema(
    {
        AmenitiesName: { type: String, required: true },
        Note: { type: String },
        IsDelete: { type: Boolean, default: false }
    },
    {
        timestamps: true,
    }
);

const Amenity = mongoose.model("Amenity", amenitySchema);

module.exports = Amenity;