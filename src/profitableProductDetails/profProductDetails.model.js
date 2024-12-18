const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profProductDeatailsSchema = new Schema({
  email: { type: String, required: true },
  folders: [
    {
      folderId: { type: String, required: false, default: "" },
      folderItemsCount: { type: Number, required: true, default: 0 },
      folderItems: [
        {
          date: { type: String, required: false, default: "" },
          asin: { type: String, required: true },
          fnsku: { type: String, required: false, default: "" },
          title: { type: String, required: false, default: "" },
          price: { type: String, required: false, default: "" },
          imageUrl: { type: String, required: false, default: "" },
          amazonFees: { type: String, required: false, default: "" },
          pickPack: { type: String, required: false, default: "" },
          totalFees: { type: String, required: false, default: "" },
          breakEven: { type: String, required: false, default: "" },
          costPerItem: { type: String, required: false, default: "" },
          miscExpenses: { type: String, required: false, default: "" },
          totalCostPerSale: { type: String, required: false, default: "" },
          netProfit: { type: String, required: false, default: "" },
          units: { type: String, required: false, default: "" },
          totalProfit: { type: String, required: false, default: "" },
          netSalesMargin: { type: String, required: false, default: "" },
          netROI: { type: String, required: false, default: "" },
          buyboxIsFBA: { type: String, required: false, default: "" },
          offerCountFBA: { type: String, required: false, default: "" },
          offerCountFBM: { type: String, required: false, default: "" },
          qtyPerSet: { type: String, required: false, default: "" },
          productGroup: { type: String, required: false, default: "" },
          brand: { type: String, required: false, default: "" },
          ian: { type: String, required: false, default: "" },
          lastPriceChange: { type: String, required: false, default: "" },
          weight: { type: String, required: false, default: "" },
          WxHxL: { type: String, required: false, default: "" },
          chartsURL: { type: String, required: false, default: "" },
          buyboxStatistics: [
            {
              seller: { type: String, required: false, default: "" },
              xPercentageWon: { type: String, required: false, default: "" },
              lastWon: { type: String, required: false, default: "" },
              stock: { type: String, required: false, default: "" },
              avgPrice: { type: String, required: false, default: "" },
            },
          ],
          variations: [
            {
              img: { type: String, required: false, default: "" },
              asin: { type: String, required: false, default: "" },
              variation: { type: String, required: false, default: "" },
              requestPackaging: { type: String, required: false, default: "" },
              reviews: { type: String, required: false, default: "" },
            },
          ],
          isHazmat: { type: Boolean, required: false, default: false },
          note: { type: String, required: false, default: "" },
          supplier: {
            _id: { type: String, required: false, default: "" },
            supplierName: { type: String, required: false, default: "" },
            supplierAddress: {
              street: { type: String, required: false, default: "" },
              city: { type: String, required: false, default: "" },
              state: { type: String, required: false, default: "" },
              zipCode: { type: String, required: false, default: "" },
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
    },
  ],
});

const profProductDetailsModel = mongoose.model(
  "profProductDetails",
  profProductDeatailsSchema,
  "profProductDetails"
);

module.exports = profProductDetailsModel;
