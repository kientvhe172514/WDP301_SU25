const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    cccd: { type: String, required: true, unique: true }
}, { timestamps: true });

const Customer = mongoose.model("Customer", CustomerSchema);


module.exports = Customer;