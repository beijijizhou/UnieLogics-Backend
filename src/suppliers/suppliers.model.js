const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const suppliersSchema = new Schema({
  email: { type: String, required: true },
  suppliers: [
    {
      _id: { type: String, required: true },
      onlineSupplier: { type: String, required: true },
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
      infoPlusId:{type: String, required: false},
    },
  ],
});

const shipmentPlanModel = mongoose.model(
  "suppliers",
  suppliersSchema,
  "suppliers"
);

module.exports = shipmentPlanModel;
