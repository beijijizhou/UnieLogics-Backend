const ProfProductDetailsService = require(".");

const addProfProductDetails = async (req, res) => {
  const {
    email,
    asin,
    fnsku,
    title,
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
    supplier,
    folderId,
    isHazmat,
  } = req.body;

  try {
    const addProductDetailsToSpecificFolderResponse =
      await ProfProductDetailsService.addProductToSpecificFolderAndIfFlderNotExistCreateIt(
        {
          email,
          folderId,
          date: new Date(),
          asin,
          fnsku,
          title,
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
          supplier,
          isHazmat,
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

const getProfitableProductDetails = async (req, res) => {
  const { email, folderId, asin } = req.query;

  if (!folderId || !asin) {
    return res.status(403).json({
      status: "error",
      message:
        "There was an error retrieving the product details. Email, Folder Id and Asin are mandatory to be provided.",
    });
  }

  try {
    const retrieveProfProductDetailsResponse =
      await ProfProductDetailsService.getProfProductDetailsFromFolder({
        email,
        folderId,
        asin,
      });

    if (retrieveProfProductDetailsResponse.status === "error") {
      return res.status(400).json({
        ...retrieveProfProductDetailsResponse,
      });
    }

    return res.status(200).json({
      status: "success",
      response: { ...retrieveProfProductDetailsResponse },
      message: `Succeffully retrieved details for asin: ${asin}`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  addProfProductDetails,
  getProfitableProductDetails,
};
