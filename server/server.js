const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cart.routes");
const Order = require("./routes/order.routes");
const Payment = require("./models/Payment");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", Order);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// =========================
// CREATE PAYMENT
// =========================
app.post("/create-payment", async (req, res) => {
  try {
    let { amount, deliveryCharge } = req.body;

    amount = Number(amount);
    deliveryCharge = Number(deliveryCharge) || 0;

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const transaction_uuid = Date.now().toString();
    const product_code = "EPAYTEST";

    // eSewa formula: total = amount + tax + service_charge + delivery_charge
    // All extra charges must be declared individually — NOT rolled into amount
    const tax_amount = 0;
    const product_service_charge = 0;
    const product_delivery_charge = deliveryCharge; // declared separately
    const total_amount = amount + tax_amount + product_service_charge + product_delivery_charge;

    // Signature covers total_amount as computed above
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    const signature = crypto
      .createHmac("sha256", process.env.SECRET_KEY)
      .update(message)
      .digest("base64");

    await Payment.create({
      transaction_uuid,
      total_amount,
      amount,
      product_code,
      status: "PENDING",
    });

    res.json({
      amount: amount.toString(),
      total_amount: total_amount.toString(),
      deliveryCharge: product_delivery_charge.toString(),
      transaction_uuid,
      signature,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// VERIFY PAYMENT
// =========================
app.post("/verify-payment", async (req, res) => {
  try {
    const { transaction_uuid, total_amount } = req.body;

    const payment = await Payment.findOne({ transaction_uuid });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const response = await axios.get(
      "https://rc-epay.esewa.com.np/api/epay/transaction/status/",
      {
        params: {
          product_code: "EPAYTEST",
          total_amount: payment.total_amount.toString(),
          transaction_uuid,
        },
      }
    );

    if (!response.data) {
      return res.status(400).json({ message: "No response from eSewa" });
    }

    const updated = await Payment.findOneAndUpdate(
      { transaction_uuid },
      {
        status: response.data.status || "UNKNOWN",
        ref_id: response.data.ref_id || null,
      },
      { returnDocument: "after" }
    );

    return res.json(updated);
  } catch (err) {
    console.log("VERIFY ERROR:", err.response?.data || err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});