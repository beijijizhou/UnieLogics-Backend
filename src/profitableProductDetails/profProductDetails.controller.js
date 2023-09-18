const ProfProductDetailsService = require(".");

const addProfProductDetails = async (req, res) => {
  const {
    email,
    asin,
    price,
    imageUrl,
    amazonFees,
    pickPack,
    totalFees,
    breakEven,
    costPerItem,
    miscExpenses,
    totalCostPerSale,
    netProfit,
    units,
    totalProfit,
    netSalesMargin,
    netROI,
    buyboxIsFBA,
    offerCountFBA,
    offerCountFBM,
    qtyPerSet,
    productGroup,
    brand,
    ian,
    lastPriceChange,
    weight,
    WxHxL,
    chartsURL,
    buyboxStatistics,
    variations,
    note,
    supplierUrl,
    folderId,
  } = req.body;

  try {
    const addProductDetailsToSpecificFolderResponse =
      await ProfProductDetailsService.addProductToSpecificFolderAndIfFlderNotExistCreateIt(
        {
          email,
          folderId,
          date: new Date(),
          asin,
          price,
          imageUrl,
          amazonFees,
          pickPack,
          totalFees,
          breakEven,
          costPerItem,
          miscExpenses,
          totalCostPerSale,
          netProfit,
          units,
          totalProfit,
          netSalesMargin,
          netROI,
          buyboxIsFBA,
          offerCountFBA,
          offerCountFBM,
          qtyPerSet,
          productGroup,
          brand,
          ian,
          lastPriceChange,
          weight,
          WxHxL,
          chartsURL,
          buyboxStatistics,
          variations,
          note,
          supplierUrl,
        }
      );

    return res.status(200).json({
      ...addProductDetailsToSpecificFolderResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  addProfProductDetails,
};
