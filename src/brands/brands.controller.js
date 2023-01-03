const BrandsService = require("../brands");

const getAllBlacklistBrands = async (req, res) => {
  const products = await BrandsService.getAll();
  if (products) {
    res.status(200).json(products);
  } else {
    res.status(400).json({
      message: "Bad request",
    });
  }
};

const getBlacklistBrandByName = async (req, res) => {
  const { name } = req.query;

  console.log(name);

  if (!name) {
    console.log("No name has been provided! Please provide a brand name!");

    return res.status(400).json({
      status: "error",
      message:
        "Name must be provided to return a blacklist status for that brand name.",
    });
  }

  try {
    const userWithProducts = await BrandsService.getUserByEmail(
      email.toLowerCase()
    );
    console.log(userWithProducts);
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved products for the user ${email}`,
      products: userWithProducts || [],
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  getAllBlacklistBrands,
  getBlacklistBrandByName,
};
