const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
    {
        PermissionName: { type: String, required: true, unique: true, trim: true },
        Note: { type: String, trim: true },
    }
);

const Permission = mongoose.model("permissions", permissionSchema);

module.exports = Permission;
