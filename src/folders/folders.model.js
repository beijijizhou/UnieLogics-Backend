const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foldersSchema = new Schema({
  email: { type: String, required: true },
  folders: [
    {
      folderName: { type: String, required: true },
      folderItems: [
        {
          date: { type: Date, required: true, default: null },
          title: { type: String, required: true, default: "" },
          asin: { type: String, required: true, default: "" },
          price: { type: String, required: false, default: "" },
          imageUrl: { type: String, required: true, default: "New" },
          folderId: { type: String, required: true },
        },
      ],
      folderItemsCount: { type: Number, required: true, default: 0 },
      folderColor: { type: String, required: true, default: "#fffffff" },
    },
  ],
});

const foldersModel = mongoose.model("folders", foldersSchema, "folders");

module.exports = foldersModel;
