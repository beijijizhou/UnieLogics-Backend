const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const brandsSchema = new Schema({
  name: { type: String, required: true },
  brandDateAdded: { type: Date, default: null },
  brandDateModified: { type: Date, default: null },
});

const brandsModel = mongoose.model("brands", brandsSchema, "brands");

module.exports = brandsModel;
