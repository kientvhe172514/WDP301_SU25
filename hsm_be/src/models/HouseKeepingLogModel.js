const mongoose = require("mongoose");

const housekeepingLogSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    status: {
        type: String,
        enum: ["Needs Cleaning", "In Progress", "Cleaned"],
        required: true,
    },
    notes: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now }
});

const HousekeepingLog = mongoose.model("HousekeepingLog", housekeepingLogSchema);
module.exports = HousekeepingLog;
