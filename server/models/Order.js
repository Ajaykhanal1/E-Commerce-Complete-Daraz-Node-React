const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        userId: String,
        name: String,
        email: String,
    },

    customer: {
        address: String,
        phone: String,
    },

    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    items: [
        {
            productId: String,
            name: String,
            price: Number,
            quantity: Number,
            image: String,
            sellerId: String,
        }
    ],

    pricing: {
        subtotal: Number,
        deliveryCharge: Number,
        codCharge: Number,
        grandTotal: Number,
    },

    status: {
        type: String,
        default: "Pending",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Order", orderSchema);