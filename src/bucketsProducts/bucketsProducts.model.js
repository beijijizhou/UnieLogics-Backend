const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  email: { type: String, required: true },
  productsDetails: { type: Array, default: [] },
  productsLeft: { type: Number, default: 50 },
});

const productModel = mongoose.model("product", productSchema, "product");

module.exports = productModel;
