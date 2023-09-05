const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foldersSchema = new Schema({
  email: { type: String, required: true },
  folders: [
    {
      folderName: { type: String, required: true },
      folderItems: { type: Array, required: true, default: [] },
      folderItemsCount: { type: Number, required: true, default: 0 },
      folderColor: { type: String, required: true, default: "#fffffff" },
    },
  ],
});

const foldersModel = mongoose.model("folders", foldersSchema, "folders");

module.exports = foldersModel;
