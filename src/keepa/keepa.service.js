const saveKeepaChartDataToDatabase =
  (Keepa) =>
  async ({ keepaProduct }) => {
    const dataInDb = await Keepa.findOne({
      asin: keepaProduct.products[0].asin,
    });

    console.log(
      "Product exists and is older than 3 days, updating. ASIN is " +
        keepaProduct.products[0].asin
    );

    if (dataInDb) {
      console.log(dataInDb);
      updateObj = {
        date: new Date(),
        asin: keepaProduct.products[0].asin,
        timestamp: keepaProduct.timestamp,
        tokensLeft: keepaProduct.tokensLeft,
        refillIn: keepaProduct.refillIn,
        refillRate: keepaProduct.refillRate,
        tokenFlowReduction: keepaProduct.tokenFlowReduction,
        tokensConsumed: keepaProduct.tokensConsumed,
        processingTimeInMs: keepaProduct.processingTimeInMs,
        products: [...keepaProduct.products],
      };

      await Keepa.findOneAndUpdate(
        { asin: keepaProduct.products[0].asin },
        updateObj
      );
      return await keepaProductToSave.findOne({
        asin: keepaProduct.products[0].asin,
      });
    }
    const keepaProductToSave = new Keepa({
      date: new Date(),
      asin: keepaProduct.products[0].asin,
      timestamp: keepaProduct.timestamp,
      tokensLeft: keepaProduct.tokensLeft,
      refillIn: keepaProduct.refillIn,
      refillRate: keepaProduct.refillRate,
      tokenFlowReduction: keepaProduct.tokenFlowReduction,
      tokensConsumed: keepaProduct.tokensConsumed,
      processingTimeInMs: keepaProduct.processingTimeInMs,
      products: [...keepaProduct.products],
    });

    return keepaProductToSave.save();
  };

const getKeepaChartDataFromDatabase =
  (Keepa) =>
  async ({ asin }) => {
    return await Keepa.findOne({ asin });
  };

module.exports = (Keepa) => {
  return {
    saveKeepaChartDataToDatabase: saveKeepaChartDataToDatabase(Keepa),
    getKeepaChartDataFromDatabase: getKeepaChartDataFromDatabase(Keepa),
  };
};
