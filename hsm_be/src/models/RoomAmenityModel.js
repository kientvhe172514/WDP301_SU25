const mongoose = require("mongoose");

const roomAmenitySchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room", // Reference to the 'rooms' collection
        required: true,
    },
    amenity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenity", // Reference to the 'amenities' collection
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    status: {
        type: String,
        required: true,
        enum: ['Functioning', 'Broken', 'Missing', 'Other'],
        default: 'Functioning'
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            if (ret.amenity) {
                ret.AmenitiesName = ret.amenity.AmenitiesName;
                ret.Note = ret.amenity.Note;
            }
            ret._id = ret.amenity._id; // Use amenity ID as the main ID
            delete ret.amenity;
            delete ret.room;
            return ret;
        },
    },
});

// Add compound index to prevent duplicate amenities for a room
roomAmenitySchema.index({ room: 1, amenity: 1 }, { unique: true });

const RoomAmenity = mongoose.model("RoomAmenity", roomAmenitySchema);

module.exports = RoomAmenity;
