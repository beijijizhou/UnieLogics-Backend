const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const savedSearchesSchema = new Schema({
  savedSearchTerm: { type: String, required: true },
  savedSearchUrl: { type: String, required: true },
  tunnelVisionAvg: { type: Array, default: [] },
});

const savedSearchesModel = mongoose.model(
  "savedSearches",
  savedSearchesSchema,
  "savedSearches"
);

module.exports = savedSearchesModel;
