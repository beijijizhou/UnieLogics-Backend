const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const whOwners = new Schema({
  email: { type: String, required: true },
  wharehouses: [
    {
      dateAdded: { type: Date, default: null },
      dateModified: { type: Date, default: null },
      name: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      llcName: { type: String, required: true },
      businessName: { type: String, required: true },
      businessAddress: {
        type: Array,
        required: true,
        default: [{ address: "", state: "", city: "", zipCode: "" }],
      },
      businessPhoneNumber: { type: String, required: true },
      password: { type: String, required: false },
      customerServiceEmailAddress: { type: String, required: true },
      costPerItemLabeling: { type: String, required: true },
      costPerBoxClosing: { type: String, required: true },
      costPerBox: {
        type: Array,
        required: true,
        default: [
          {
            type: "",
            name: "",
            size: {
              width: "",
              height: "",
              length: "",
            },
            price: "",
          },
        ],
      },
      handleShrink: {
        type: Object,
        required: true,
        default: {
          answer: { type: String, required: false },
          small: { price: "" },
          medium: { price: "" },
          large: { price: "" },
        },
      },
      handleHazmat: {
        type: Object,
        required: true,
        default: {
          answer: "",
          pricePerItem: "",
        },
      },
      bubbleWrapping: {
        type: Object,
        required: true,
        default: {
          answer: "",
          pricePerItem: "",
        },
      },
      offerStorage: {
        type: Object,
        required: true,
        default: {
          answer: "",
          pricePerPalet: "",
          pricePerCubicFeet: "",
        },
      },
    },
  ],
});

const whOwnersModel = mongoose.model("whOwners", whOwners, "whOwners");

module.exports = whOwnersModel;
