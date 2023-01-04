const dayjs = require("dayjs");

const getBlacklistBrandByName = (Brands) => async (name) => {
  // console.log(Brands.findOne({ name }));
  return await Brands.findOne({ name });
};

const getAllBlacklistBrands = (Brands) => async () => {
  return await Brands.find();
};

const addBrandToDatabase =
  (Brands) =>
  async ({ brands }) => {
    const allBrandsFromDB = await Brands.find();

    brands.forEach((brand) => {
      const brandAlreadyExists = allBrandsFromDB.some(
        (el) => el.name === brand.toLowerCase()
      );
      if (!brandAlreadyExists) {
        new Brands({
          name: brand.toLowerCase(),
          brandDateAdded: dayjs().format(),
          brandDateModified: dayjs().format(),
        }).save();
      }
    });
  };

module.exports = (Product) => {
  return {
    getBlacklistBrandByName: getBlacklistBrandByName(Product),
    getAllBlacklistBrands: getAllBlacklistBrands(Product),
    addBrandToDatabase: addBrandToDatabase(Product),
  };
};
