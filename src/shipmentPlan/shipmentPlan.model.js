const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shipmentPlanSchema = new Schema({
  email: { type: String, required: true },
  shipmentPlans: [
    {
      _id: { type: String, required: true },
      products: [
        {
          asin: { type: String, required: true },
          title: { type: String, required: true },
          inventory: { type: String, required: true },
          dateAdded: { type: String, required: true },
          wxhxl: { type: String, required: true },
          amazonPrice: { type: String, required: true },
          supplier: { type: String, required: true },
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
