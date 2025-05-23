const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
        phone: { type: Number },
        address: { type: String },
        city: { type: String },
        avartar: { type: String },
    },
    {
        timestamps: true,
    }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
