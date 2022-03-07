const getAll = (Product) => async () => {
  return await Product.find();
};

const addUserWithProductIfNoUser =
  (Product) =>
  ({ email, productsDetails }) => {
    const product = new Product({
      email,
      productsDetails: [
        {
          asin: productsDetails.asin,
          detailPageURL: productsDetails.detailPageURL,
          imageUrl: productsDetails.imageUrl,
          price: productsDetails.price,
          offersCount: productsDetails.offersCount,
          salesRank: productsDetails.salesRank,
          title: productsDetails.title,
        },
      ],
    });

    return product.save();
  };

const findUserWithProducts =
  (Product) =>
  async ({ email }) => {
    return await Product.findOne({ email });
  };

const getUserByEmail = (Product) => async (email) => {
  return await Product.findOne({ email });
};

const updateProductsForSpecificUser =
  (Product) =>
  async ({ email, productsDetails }) => {
    let updateObj = {};
    let asinAlreadyExists = false;
    const currentUserWithProducts = await Product.findOne({ email });
    const currentProductsDetails = currentUserWithProducts.productsDetails;

    updateObj = {
      email: email,
      productsDetails: [
        ...currentProductsDetails,
        {
          asin: productsDetails.asin,
          detailPageURL: productsDetails.detailPageURL,
          imageUrl: productsDetails.imageUrl,
          price: productsDetails.price,
          offersCount: productsDetails.offersCount,
          salesRank: productsDetails.salesRank,
          title: productsDetails.title,
        },
      ],
    };
    currentProductsDetails.map((currentProduct) => {
      if (currentProduct.asin === productsDetails.asin) {
        asinAlreadyExists = true;
      }
    });

    if (!asinAlreadyExists) {
      let newlyAddedProducts = await Product.findOneAndUpdate(
        { email },
        updateObj
      );
      return {
        message: `Your new ASIN has been successfully added. Newly created ASIN is ${productsDetails.asin}`,
        newlyAddedProducts,
      };
    } else {
      return {
        message:
          "The current ASIN has already been inserted, so we did not add it twice.",
        currentUserWithProducts,
      };
    }
  };

module.exports = (Product) => {
  return {
    getAll: getAll(Product),
    addUserWithProductIfNoUser: addUserWithProductIfNoUser(Product),
    findUserWithProducts: findUserWithProducts(Product),
    getUserByEmail: getUserByEmail(Product),
    updateProductsForSpecificUser: updateProductsForSpecificUser(Product),
  };
};
