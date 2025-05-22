const mongoose = require("mongoose");

const housekeepingTaskSchema = new mongoose.Schema(
    {
        room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // Nhân viên dọn phòng
        taskType: {
            type: String,
            enum: ["Cleaning", "Maintenance"],
            required: true
        },
        status: {
            type: String,
            enum: ["In Progress", "Completed", "Cancelled"],
            default: "In Progress"
        },
        notes: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
        completedAt: { type: Date }
    }
);

const HousekeepingTask = mongoose.model("HousekeepingTask", housekeepingTaskSchema);
module.exports = HousekeepingTask;
