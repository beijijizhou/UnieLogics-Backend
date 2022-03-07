const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  email: { type: String, required: true },
  productsDetails: { type: Array, default: [] },
});

const productModel = mongoose.model("product", productSchema, "product");

module.exports = productModel;
