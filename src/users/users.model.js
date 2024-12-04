const mongoose = require("mongoose");
const oauthSchema = require("./oauth.model");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: false, default: "" },
  hash: { type: String, required: true },
  oauth: { type: oauthSchema, default: null},
  billingID: String,
  plan: {
    type: String,
    enum: ["free", "none", "plan17", "plan163", "plan37", "plan287"],
    default: "none",
  },
  hasTrial: { type: Boolean, default: false },
  phoneNumber: { type: String, default: null },
  endDate: { type: Date, default: null },
  role: {
    type: String,
    enum: ["user", "admin", "warehouseOwner"],
    default: "user",
  },
  hasActiveSubscription: { type: Boolean, default: false },
  notifications: { type: Boolean, default: false },
  salesPerMonthCheck: { type: Number, default: null },
  survey: {
    step1: { type: Array, default: [] },
    step2: { type: String, default: "" },
    completed: { type: Boolean, default: false },
  },
});

const userModel = mongoose.model("user", userSchema, "user");

module.exports = userModel;