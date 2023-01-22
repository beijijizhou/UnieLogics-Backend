const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fLinksSchema = new Schema({
  name: { type: String, required: true },
  link: { type: String, required: true },
  fLinkDateAdded: { type: Date, default: null },
  fLinkDateModified: { type: Date, default: null },
});

const fLinksModel = mongoose.model("fLinks", fLinksSchema, "fLinks");

module.exports = fLinksModel;
