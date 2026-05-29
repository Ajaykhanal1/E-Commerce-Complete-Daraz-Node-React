const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0, // percentage like 10 = 10%
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },

    seller: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: String,
      email: String,
      phone: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
