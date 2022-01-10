const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  hash: { type: String, required: true },
  billingID: String,
  plan: { type: String, enum: ["none", "basic", "pro"], default: "none" },
  hasTrial: { type: Boolean, default: false },
  endDate: { type: Date, default: null },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  hasActiveSubscription: { type: Boolean, default: false },
  notifications: { type: Boolean, default: false },
  salesPerMonthCheck: { type: Number, default: null },
});

const userModel = mongoose.model("user", userSchema, "user");

module.exports = userModel;