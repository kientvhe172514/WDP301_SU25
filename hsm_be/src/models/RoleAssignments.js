const mongoose = require("mongoose");

const roleAssignmentSchema = new mongoose.Schema({
    role: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Roles",
            required: true,
        }
    ],
    account: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
        }
    ],
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
});

const RoleAssignment = mongoose.model("RoleAssignment", roleAssignmentSchema);
module.exports = RoleAssignment;