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
        fbaLabels: [
          {
            filename: { type: String, required: false, default: "" },
          },
        ],
        otherFiles: [
          {
            filename: { type: String, required: false, default: "" },
          },
        ],
      },
      orderNo: { type: String, required: false, default: "" },
      receiptNo: { type: String, required: false, default: "" },
      orderDate: { type: Date, required: false, default: null },
      warehouseOwner: {
        city: { type: String, required: false, default: "" },
        address: { type: String, required: false, default: "" },
        state: { type: String, required: false, default: "" },
        zipCode: { type: String, required: false, default: "" },
        lat: { type: String, required: false, default: "" },
        long: { type: String, required: false, default: "" },
        _id: { type: String, required: false, default: "" },
      },
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
      amazonData: {
        genericFrom: { type: String, required: false, default: "" },
        shipDate: { type: String, required: false, default: "" },
        workFlowId: { type: String, required: false, default: "" },
        trackShipmentValue: { type: String, required: false, default: "" },
        trackShipmentUrl: { type: String, required: false, default: "" },
        shipments: [
          {
            amazonReferenceId: { type: String, required: false, default: "" },
            boxes: { type: String, required: false, default: "" },
            carriesCharges: { type: String, required: false, default: "" },
            contents: {
              boxes: { type: String, required: false, default: "" },
              skus: { type: String, required: false, default: "" },
              units: { type: String, required: false, default: "" },
              weight: { type: String, required: false, default: "" },
            },
            shipFrom: { type: String, required: false, default: "" },
            shipTo: { type: String, required: false, default: "" },
            shipmentId: { type: String, required: false, default: "" },
            shipmentName: { type: String, required: false, default: "" },
            skus: { type: String, required: false, default: "" },
            units: { type: String, required: false, default: "" },
            thumbnailUrls: [
              { url: { type: String, required: false, default: "" } },
            ],
          },
        ],
      },
    },
  ],
});

const shipmentPlanModel = mongoose.model(
  "shipmentPlans",
  shipmentPlanSchema,
  "shipmentPlans"
);

module.exports = shipmentPlanModel;
