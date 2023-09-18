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
              reqPackaging: { type: String, required: false, default: "" },
              reviews: { type: String, required: false, default: "" },
            },
          ],
          note: { type: String, required: false, default: "" },
          supplierUrl: { type: String, required: false, default: "" },
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
