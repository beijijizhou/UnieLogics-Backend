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
        (el) => el.name === brand.toString().toLowerCase()
      );
      if (!brandAlreadyExists) {
        new Brands({
          name: brand.toString().toLowerCase(),
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

const findAndEditBlacklistBrand =
  (Brands) =>
  async ({ _id, newValue }) => {
    const filter = { _id };
    const update = { name: newValue };
    await Brands.findOneAndUpdate(filter, update);
    return await Brands.findOne(filter);
  };

const searchForBlacklistBrands = (Brands) => async (searchTerm) => {
  const term = new RegExp(searchTerm, "i");
  return await Brands.find({ name: { $regex: term } });
};

module.exports = (Brands) => {
  return {
    getBlacklistBrandByName: getBlacklistBrandByName(Brands),
    getAllBlacklistBrands: getAllBlacklistBrands(Brands),
    addBlacklistBrandToDatabase: addBlacklistBrandToDatabase(Brands),
    getMaxItems: getMaxItems(Brands),
    deleteOneBrand: deleteOneBrand(Brands),
    findAndEditBlacklistBrand: findAndEditBlacklistBrand(Brands),
    searchForBlacklistBrands: searchForBlacklistBrands(Brands),
  };
};
