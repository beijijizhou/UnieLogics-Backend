const getAll = (Product) => async () => {
  return await Product.find();
};

const addProductIfNoProducts =
  (Product) =>
  ({ email, asin, url, image, price }) => {
    const product = new Product({
      email,
      asin,
      url,
      image,
      price,
    });

    return product.save();
  };

const findUserWithProducts =
  (Product) =>
  async ({ email }) => {
    return await Product.findOne({ email });
  };

module.exports = (Product) => {
  return {
    getAll: getAll(Product),
    addProductIfNoProducts: addProductIfNoProducts(Product),
    findUserWithProducts: findUserWithProducts(Product),
  };
};
