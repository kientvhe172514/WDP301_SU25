const mongoose = require("mongoose");

const roleschema = new mongoose.Schema({
    RoleName: { type: String, required: true, unique: true, trim: true },
    Note: { type: String, trim: true },
    IsDelete: { type: Boolean, trim: true },
});

const Roles = mongoose.model("Roles", roleschema);

module.exports = Roles;
