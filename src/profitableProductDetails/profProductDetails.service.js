const addProductToSpecificFolderAndIfFlderNotExistCreateIt =
  (ProfProductDetails) =>
  async ({
    email,
    folderId,
    date,
    asin,
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
  }) => {
    const userWithProfProductDetails = await ProfProductDetails.findOne({
      email,
    });

    if (!userWithProfProductDetails) {
      // Create a new user and product details if the user doesn't exist
      const newUserWithProductDetails = new ProfProductDetails({
        email,
        folders: [
          {
            folderId,
            folderItems: [
              {
                date,
                asin,
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
              },
            ],
          },
        ],
      });
      await newUserWithProductDetails.save();

      return {
        status: "success",
        message: "Successfully saved product details.",
      };
    }

    // Find the folder with the provided folderId or create a new folder
    let folderWithIdFound = false;
    userWithProfProductDetails.folders.forEach((folder) => {
      if (JSON.stringify(folder.folderId) === JSON.stringify(folderId)) {
        folderWithIdFound = true;

        // Find the product with the provided ASIN or create a new product
        let productFound = false;
        folder.folderItems.forEach((item) => {
          if (item.asin === asin) {
            // Update the values of the item when the product exists
            if (
              supplier !== undefined &&
              supplier !== null &&
              supplier !== "" &&
              Object.keys(supplier).length > 0
            ) {
              item.supplier = supplier;
            }
            if (date) item.date = date;
            if (title) item.title = title;
            if (price) item.price = price;
            if (imageUrl) item.imageUrl = imageUrl;
            if (amazonFees) item.amazonFees = amazonFees;
            if (pickPack) item.pickPack = pickPack;
            if (totalFees) item.totalFees = totalFees;
            if (breakEven) item.breakEven = breakEven;
            if (costPerItem) item.costPerItem = costPerItem;
            if (miscExpenses) item.miscExpenses = miscExpenses;
            if (totalCostPerSale) item.totalCostPerSale = totalCostPerSale;
            if (netProfit) item.netProfit = netProfit;
            if (units) item.units = units;
            if (totalProfit) item.totalProfit = totalProfit;
            if (netSalesMargin) item.netSalesMargin = netSalesMargin;
            if (netROI) item.netROI = netROI;
            if (buyboxIsFBA) item.buyboxIsFBA = buyboxIsFBA;
            if (offerCountFBA) item.offerCountFBA = offerCountFBA;
            if (offerCountFBM) item.offerCountFBM = offerCountFBM;
            if (qtyPerSet) item.qtyPerSet = qtyPerSet;
            if (productGroup) item.productGroup = productGroup;
            if (brand) item.brand = brand;
            if (ian) item.ian = ian;
            if (lastPriceChange) item.lastPriceChange = lastPriceChange;
            if (weight) item.weight = weight;
            if (WxHxL) item.WxHxL = WxHxL;
            if (chartsURL) item.chartsURL = chartsURL;
            if (buyboxStatistics) item.buyboxStatistics = buyboxStatistics;
            if (variations) item.variations = variations;
            if (note) item.note = note;
            if (isHazmat) item.isHazmat = isHazmat;
            productFound = true;
          }
        });

        if (!productFound) {
          // Create a new product with provided fields
          folder.folderItems.push({
            date,
            asin,
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
          });
          folder.folderItemsCount = folder.folderItems.length;
        }
      }
    });

    if (!folderWithIdFound) {
      // Create a new folder with the provided product details
      userWithProfProductDetails.folders.push({
        folderId,
        folderItemsCount: 1, // Since we're adding a new product
        folderItems: [
          {
            date,
            asin,
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
          },
        ],
      });
    }

    // Save the updated user document
    await userWithProfProductDetails.save();

    return {
      status: "success",
      message: "Successfully updated/saved product details.",
    };
  };

const getProfProductDetailsFromFolder =
  (ProfProductDetails) =>
  async ({ email, folderId, asin }) => {
    const userWithProfProductDetails = await ProfProductDetails.findOne({
      email,
    });

    if (!userWithProfProductDetails) {
      return {
        status: "error",
        message: "There is nothing to be retrieved.",
      };
    }

    const folderWithSpecificId = userWithProfProductDetails.folders.filter(
      (folder) => folder.folderId === folderId
    );

    if (folderWithSpecificId.length === 0) {
      return {
        status: "error",
        message: "There is no folder with this id.",
      };
    }
    const productDetails = folderWithSpecificId[0].folderItems.filter(
      (item) => item.asin === asin
    );

    if (productDetails.length === 0) {
      return {
        status: "error",
        message: "There is no product with this ASIN.",
      };
    }

    if (productDetails.length > 0) {
      return {
        productDetails,
      };
    }
  };

module.exports = (ProfProductDetails) => {
  return {
    addProductToSpecificFolderAndIfFlderNotExistCreateIt:
      addProductToSpecificFolderAndIfFlderNotExistCreateIt(ProfProductDetails),
    getProfProductDetailsFromFolder:
      getProfProductDetailsFromFolder(ProfProductDetails),
  };
};
