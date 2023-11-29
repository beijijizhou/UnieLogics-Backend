const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shipmentPlanSchema = new Schema({
  email: { type: String, required: true },
  shipmentPlans: [
    {
      _id: { type: String, required: true },
      shipmentTitle: { type: String, required: true },
      dateAdded: { type: Date, required: false, default: null },
      dateUpdated: { type: Date, required: false, default: null },
      status: { type: String, required: false, default: "Added" },
      files: {
        fbaLabels: {
          filename: { type: String, required: false, default: "" },
        },
        otherFiles: {
          filename: { type: String, required: false, default: "" },
        },
      },
      orderNo: { type: String, required: false, default: "" },
      receiptNo: { type: String, required: false, default: "" },
      orderDate: { type: Date, required: false, default: null },
      products: [
        {
          asin: { type: String, required: true },
          title: { type: String, required: true },
          unitsPerBox: { type: String, required: false, default: "" },
          dateAdded: { type: String, required: true },
          boxWidth: { type: String, required: false, default: "" },
          boxHeight: { type: String, required: false, default: "" },
          boxLength: { type: String, required: false, default: "" },
          amazonPrice: { type: String, required: true },
          imageUrl: { type: String, required: true },
          fnsku: { type: String, required: false, default: "" },
          boxes: { type: String, required: false, default: "" },
          weightPerBox: { type: String, required: false, default: "" },
          upc: { type: String, required: false, default: "" },
          isHazmat: { type: Boolean, required: false, default: false },
          supplier: {
            _id: { type: String, required: true },
            supplierName: { type: String, required: true },
            supplierAddress: {
              street: { type: String, required: true },
              city: { type: String, required: true },
              state: { type: String, required: true },
              zipCode: { type: String, required: true },
              lat: { type: String, required: false, default: "" },
              long: { type: String, required: false, default: "" },
            },
            supplierLink: { type: String, required: true },
            contactPerson: {
              name: { type: String, required: true },
              email: { type: String, required: true },
              phoneNumber: { type: String, required: true },
              extensionCode: { type: String, required: true },
            },
          },
        },
      ],
    },
  ],
});

const shipmentPlanModel = mongoose.model(
  "shipmentPlans",
  shipmentPlanSchema,
  "shipmentPlans"
);

module.exports = shipmentPlanModel;
