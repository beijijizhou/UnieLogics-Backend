const dayjs = require("dayjs");

const getBlacklistBrandByName = (Brands) => async (name) => {
  // console.log(Brands.findOne({ name }));
  return await Brands.findOne({ name });
};

const getMaxItems = (Brands) => async () => {
  const allItems = await Brands.find();

  return allItems.length;
};

const getAllBlacklistBrands = (Brands) => async (page, itemsPerPage) => {
  return await Brands.find()
    .sort("name")
    .skip((parseInt(page) - 1) * parseInt(itemsPerPage))
    .limit(parseInt(itemsPerPage));
};

const addBlacklistBrandToDatabase =
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

const deleteOneBrand =
  (Brands) =>
  async ({ brand }) => {
    return await Brands.deleteOne({ name: brand });
  };

module.exports = (Brands) => {
  return {
    getBlacklistBrandByName: getBlacklistBrandByName(Brands),
    getAllBlacklistBrands: getAllBlacklistBrands(Brands),
    addBlacklistBrandToDatabase: addBlacklistBrandToDatabase(Brands),
    getMaxItems: getMaxItems(Brands),
    deleteOneBrand: deleteOneBrand(Brands),
  };
};
