const getBlacklistBrandByName = (Brands) => async (email) => {
  return await Brands.findOne({ email });
};

const getAllBlacklistBrands = (Brands) => async (email) => {
  return await Brands.find();
};

module.exports = (Product) => {
  return {
    getBlacklistBrandByName: getBlacklistBrandByName(Product),
    getAllBlacklistBrands: getAllBlacklistBrands(Product),
  };
};
