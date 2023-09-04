const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foldersSchema = new Schema({
  email: { type: String, required: true },
  folders: [
    {
      folderName: { type: String, required: true },
      folderItems: { type: Array, required: true, default: [] },
    },
  ],
});

const foldersModel = mongoose.model("folders", foldersSchema, "folders");

module.exports = foldersModel;
