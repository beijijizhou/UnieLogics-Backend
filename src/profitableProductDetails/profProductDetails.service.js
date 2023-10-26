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
  }) => {
    const userWithProfProductDetails = await ProfProductDetails.findOne({
      email,
    });
    let profProductDetailsUpdated = false;
    let folderWithIdFound = false;

    if (!userWithProfProductDetails) {
      const shapeforUserWithProfProductDetails = new ProfProductDetails({
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
              },
            ],
          },
        ],
      });
      await shapeforUserWithProfProductDetails.save();

      return {
        status: "success",
        message: "Successfully saved product details.",
      };
    }
    const updateSpecificFolderWithProductDetails =
      userWithProfProductDetails.folders.map((folder) => {
        // we verify here the folder.folderId instead of folder.id because the id is added by mongo to be unique and
        // we need the specific folder id where the product has been saved
        if (JSON.stringify(folder.folderId) === JSON.stringify(folderId)) {
          folderWithIdFound = true;

          if (folder.folderItems.length === 0) {
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
            });

            folder.folderItemsCount = folder.folderItems.length;
          } else {
            folder.folderItems.map((item) => {
              if (item.asin === asin) {
                // Update the values of the item when product exists

                item.date = date;
                item.asin = asin;
                item.title = title;
                item.price = price;
                item.imageUrl = imageUrl;
                item.amazonFees = amazonFees;
                item.pickPack = pickPack;
                item.totalFees = totalFees;
                item.breakEven = breakEven;
                item.costPerItem = costPerItem;
                item.miscExpenses = miscExpenses;
                item.totalCostPerSale = totalCostPerSale;
                item.netProfit = netProfit;
                item.units = units;
                item.totalProfit = totalProfit;
                item.netSalesMargin = netSalesMargin;
                item.netROI = netROI;
                item.buyboxIsFBA = buyboxIsFBA;
                item.offerCountFBA = offerCountFBA;
                item.offerCountFBM = offerCountFBM;
                item.qtyPerSet = qtyPerSet;
                item.productGroup = productGroup;
                item.brand = brand;
                item.ian = ian;
                item.lastPriceChange = lastPriceChange;
                item.weight = weight;
                item.WxHxL = WxHxL;
                item.chartsURL = chartsURL;
                item.buyboxStatistics = buyboxStatistics;
                item.variations = variations;
                item.note = note;
                item.supplier = supplier;

                profProductDetailsUpdated = true;
              }
              return item;
            });
            if (!profProductDetailsUpdated) {
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
              });

              folder.folderItemsCount = folder.folderItems.length;
            }
          }
        }
        return folder;
      });

    if (!folderWithIdFound) {
      userWithProfProductDetails.folders.push({
        folderId,
        folderItemsCount: 0,
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
          },
        ],
      });
    }

    const updateObj = {
      ...userWithProfProductDetails,
      folders: {
        ...updateSpecificFolderWithProductDetails,
      },
    };

    await ProfProductDetails.findOneAndUpdate({ email }, updateObj);

    return {
      status: "success",
      message: `Successfully ${
        profProductDetailsUpdated ? "updated" : "saved"
      } product details.`,
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
