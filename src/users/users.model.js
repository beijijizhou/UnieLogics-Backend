const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {v4: uuidv4} = require("uuid");

const userSchema = new Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: false, default: "" },
  hash: { type: String, required: true },
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
  customerId: { type: String, default: uuidv4() },
  vendorId: { type: String, default: null },
  warehouseId:  { type: String, default: null },
  records: { type: Array, default: []},
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
