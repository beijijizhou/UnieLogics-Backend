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
          isHazmat: { type: String, required: true },
          supplier: {
            _id: { type: String, required: false, default: "" },
            supplierName: { type: String, required: false, default: "" },
            supplierAddress: {
              street: { type: String, required: false, default: "" },
              city: { type: String, required: false, default: "" },
              state: { type: String, required: false, default: "" },
              zipCode: { type: String, required: false, default: "" },
              lat: { type: String, required: false, default: "" },
              long: { type: String, required: false, default: "" },
            },
            supplierLink: { type: String, required: false, default: "" },
            contactPerson: {
              name: { type: String, required: false, default: "" },
              email: { type: String, required: false, default: "" },
              phoneNumber: { type: String, required: false, default: "" },
              extensionCode: { type: String, required: false, default: "" },
            },
          },
        },
      ],
      folderSelected: { type: Boolean, required: false, default: false },
      folderItemsCount: { type: Number, required: true, default: 0 },
      folderColor: { type: String, required: true, default: "#fffffff" },
    },
  ],
});

const foldersModel = mongoose.model("folders", foldersSchema, "folders");

module.exports = foldersModel;
