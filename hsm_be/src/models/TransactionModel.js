const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true }],
        services: [
            {
                serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
                quantity: { type: Number, required: true },
                pricePerUnit: { type: Number, required: true },
                totalPrice: { type: Number, required: true },
            }
        ],
        BuyTime: { type: Date, required: true },
        FinalPrice: { type: Number, required: true }, // Total amount due
        PaidAmount: { type: Number, default: 0 }, // Amount paid so far
        Pay: {
            type: String,
            enum: ["Unpaid", "Partial", "Paid"],
            default: "Unpaid"
        },
        Status: {
            type: String,
            enum: ["Pending", "Completed", "Cancelled"],
            required: true
        },
        PaymentMethod: { type: String },
        PaymentReference: { type: String }, //This might be removed
        CreatedBy: { type: String, required: true },
        UpdatedBy: { type: String },
    },
    {
        timestamps: true,
    }
);

// Auto-update Pay status based on PaidAmount
transactionSchema.pre("save", function (next) {
    if (this.PaidAmount >= this.FinalPrice) {
        this.Pay = "Paid";
    } else if (this.PaidAmount > 0) {
        this.Pay = "Partial";
    } else {
        this.Pay = "Unpaid";
    }
    next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
