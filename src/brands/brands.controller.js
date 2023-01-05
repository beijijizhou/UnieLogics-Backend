const BrandsService = require("../brands");

const getAllBlacklistBrands = async (req, res) => {
  const { page, itemsPerPage } = req.query;
  const allBrands = await BrandsService.getMaxItems();
  const maxPages =
    allBrands % itemsPerPage > 0
      ? parseInt(allBrands / itemsPerPage + 1)
      : allBrands / itemsPerPage;
  const brands = await BrandsService.getAllBlacklistBrands(page, itemsPerPage);

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
    console.log("No name has been provided! Please provide a brand name!");

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

const addBrand = async (req, res) => {
  const { brands } = req.body;

  if (!brands) {
    return res.status(400).json({
      status: "error",
      message:
        "Please provide the brands in array format to add them to the database",
    });
  }

  try {
    const addedBrands = await BrandsService.addBrandToDatabase({
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

module.exports = {
  getAllBlacklistBrands,
  getBlacklistBrandByName,
  addBrand,
};
