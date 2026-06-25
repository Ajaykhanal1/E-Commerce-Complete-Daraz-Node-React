const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  transaction_uuid: { type: String, required: true, unique: true },
  total_amount: { type: Number, required: true },
  amount: { type: Number },
  product_code: { type: String, required: true },
  status: { type: String, default: "PENDING" },
  ref_id: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);