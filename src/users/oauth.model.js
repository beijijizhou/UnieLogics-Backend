const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const oauthSchema = new Schema({
  providerName: { type: String, required: true },
  providerId: { type: String, required: true },
  token: { type: String, required: false, default: "" },
})

module.exports = oauthSchema;