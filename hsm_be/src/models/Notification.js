const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        sender: { type: String, required: true },  // Người gửi
        receiverRole: { type: String, required: true }, // Vai trò nhận thông báo (Admin, Receptionist, Janitor)
        message: { type: String, required: true },
        type: { type: String, required: true },  // Loại thông báo (booking, alert,...)
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
