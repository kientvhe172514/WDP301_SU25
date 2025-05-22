const mongoose = require("mongoose");
const accounts = new mongoose.Schema(
    {
        FullName: { type: String },
        Email: { type: String, required: true, unique: true },
        Username: { type: String, required: true },
        Password: { type: String, required: true },
        IsDelete: { type: Boolean },
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "permissions",
                required: true,
            },
        ],
        refreshToken: { type: String },
    },
    {
        timestamps: true,
    }
);
const Account = mongoose.model("Account", accounts);
module.exports = Account;
