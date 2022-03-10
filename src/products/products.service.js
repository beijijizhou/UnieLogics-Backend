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
      productsLeft: 49,
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

    if (currentUserWithProducts.productsLeft <= 0) {
      return {
        status: "conflict",
        message:
          "We are sorry but you reached the limit of adding products. Please go to our platform => login => delete some products to be able to add more.",
        productsLeft: currentUserWithProducts.productsLeft,
      };
    }

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
      productsLeft: currentUserWithProducts.productsLeft - 1,
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
        status: "success",
        message: `Successfully added product ${productsDetails.asin}`,
        newlyAddedProducts,
        productsLeft: currentUserWithProducts.productsLeft - 1,
      };
    } else {
      return {
        status: "conflict",
        message:
          "The current ASIN/ISBN has already been inserted, so we did not add it twice.",
        currentUserWithProducts,
        productsLeft: currentUserWithProducts.productsLeft,
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
