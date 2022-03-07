const getAll = (Product) => async () => {
  return await Product.find();
};

const addUserWithProductIfNoUser =
  (Product) =>
  ({ email, asin, url, image, price }) => {
    const product = new Product({
      email,
      productsDetails: [
        {
          asin,
          url,
          image,
          price,
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

module.exports = (Product) => {
  return {
    getAll: getAll(Product),
    addUserWithProductIfNoUser: addUserWithProductIfNoUser(Product),
    findUserWithProducts: findUserWithProducts(Product),
    getUserByEmail: getUserByEmail(Product),
  };
};
