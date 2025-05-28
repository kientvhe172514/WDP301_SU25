const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    FullName: { type: String },
    Email: { type: String, required: true, unique: true },
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    IsDelete: { type: Boolean, default: false },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "permissions",
        required: true,
      },
    ],
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;