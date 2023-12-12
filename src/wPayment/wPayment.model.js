const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wPaymentSchema = new Schema({});

const wPaymentModel = mongoose.model("wPayment", wPaymentSchema, "wPayment");

module.exports = wPaymentModel;
