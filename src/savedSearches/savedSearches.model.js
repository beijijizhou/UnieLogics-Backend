const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const savedSearchesSchema = new Schema({
  email: { type: String, required: true },
  savedSearches: { type: Array, required: true, default: [] },
});

const savedSearchesModel = mongoose.model(
  "savedSearches",
  savedSearchesSchema,
  "savedSearches"
);

module.exports = savedSearchesModel;
