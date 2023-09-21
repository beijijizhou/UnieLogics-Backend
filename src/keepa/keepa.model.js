const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const keepaSchema = new Schema({
  date: { type: Date, required: true },
  asin: { type: String, required: true },
  timestamp: { type: Number, required: false },
  tokensLeft: { type: Number, required: false },
  refillIn: { type: Number, required: false },
  refillRate: { type: Number, required: false },
  tokenFlowReduction: { type: Number, required: false },
  tokensConsumed: { type: Number, required: false },
  processingTimeInMs: { type: Number, required: false },
  products: { type: Array, required: true, default: [] },
});

const keepaModel = mongoose.model("keepa", keepaSchema, "keepa");

module.exports = keepaModel;
