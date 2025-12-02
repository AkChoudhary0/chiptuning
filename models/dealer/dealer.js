const mongoose = require("mongoose");

const dealerSchema = new mongoose.Schema({
  business_name: { type: String, required: true },
  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  message: { type: String },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DEALER", dealerSchema);
