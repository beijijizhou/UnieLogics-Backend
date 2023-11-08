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
      products: [
        {
          asin: { type: String, required: true },
          title: { type: String, required: true },
          inventory: { type: String, required: false, default: "" },
          dateAdded: { type: String, required: true },
          wxhxl: { type: String, required: false, default: "" },
          amazonPrice: { type: String, required: true },
          imageUrl: { type: String, required: true },
          supplier: {
            _id: { type: String, required: true },
            supplierName: { type: String, required: true },
            supplierAddress: {
              street: { type: String, required: true },
              city: { type: String, required: true },
              state: { type: String, required: true },
              zipCode: { type: String, required: true },
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
