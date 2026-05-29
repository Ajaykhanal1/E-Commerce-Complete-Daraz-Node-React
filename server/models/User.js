const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: String,
    name: String,
    email: String,
    picture: String,
    password: String,
    resetToken: String,
    resetTokenExpire: Date,
    phone: String,
    role: {
      type: String,
      enum: ["customer", "seller"],
      default: "customer",
    },
    addresses: {
      type: [String],
      default: [],
    },
    payments: {
      type: [String],
      default: [],
    },
    gender: String,
    avtar: String,
    orders: [
      {
        orderId: String,
        status: String,
        amount: Number,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
