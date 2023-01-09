const BrandsService = require("../brands");

const getAllBlacklistBrands = async (req, res) => {
  const { page, itemsPerPage } = req.query;
  const allBrands = await BrandsService.getMaxItems();
  const maxPages =
    allBrands % itemsPerPage > 0
      ? parseInt(allBrands / itemsPerPage + 1)
      : allBrands / itemsPerPage;

  const brands = await BrandsService.getAllBlacklistBrands(
    page < 1 ? 1 : page,
    itemsPerPage
  );

  if (brands) {
    res.status(200).json({
      items: brands,
      maxPages,
      page,
      itemsPerPage,
    });
  } else {
    res.status(400).json({
      message: "Bad request",
    });
  }
};

const getBlacklistBrandByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    console.log(
      "No name has been provided when doing getBlacklistBrandByName!"
    );

    return res.status(400).json({
      status: "error",
      message:
        "Name must be provided to return a blacklist status for that brand name.",
    });
  }

  try {
    const brand = await BrandsService.getBlacklistBrandByName(
      name.toLowerCase()
    );
    console.log(brand);
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved brand with name: ${name}`,
      products: brand,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const addBlacklistBrand = async (req, res) => {
  const { brands } = req.body;

  if (!brands) {
    return res.status(400).json({
      status: "error",
      message:
        "Please provide the brands in array format to add them to the database",
    });
  }

  try {
    const addedBrands = await BrandsService.addBlacklistBrandToDatabase({
      brands,
    });

    return res.status(200).json({
      status: "success",
      message: `Successfully added brands to the database!`,
      addedBrands,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const deleteBlacklistBrand = async (req, res) => {
  const { brand } = req.body;

  if (!brand) {
    return res.status(400).json({
      status: "error",
      message: "Please provide the brand name that you want to delete",
    });
  }

  const brandFromDB = await BrandsService.getBlacklistBrandByName(
    brand.toLowerCase()
  );

  if (brandFromDB) {
    try {
      await BrandsService.deleteOneBrand({ brand: brand.toLowerCase() });

      return res.status(200).json({
        status: "success",
        message: `Successfully deleted brand ${brand}`,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ status: "error", message: JSON.stringify(e) });
    }
  } else {
    res.status(404).json({
      status: "error",
      message: `Sorry, we couldn't find brand with name: ${brand}`,
    });
  }
};

const editBrand = async (req, res) => {};

module.exports = {
  getAllBlacklistBrands,
  getBlacklistBrandByName,
  addBlacklistBrand,
  deleteBlacklistBrand,
};
