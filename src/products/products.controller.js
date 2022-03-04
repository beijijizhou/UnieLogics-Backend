const ProductService = require("../products");

const getAllProducts = async (req, res) => {
  const products = await ProductService.getAll();
  if (products) {
    res.status(200).json(products);
  } else {
    res.status(400).json({
      message: "Bad request",
    });
  }
};

const addProduct = async (req, res) => {
  const { email, productDetails } = req.body;
  let userWithProducts = await ProductService.findUserWithProducts(email);

  console.log(userWithProducts);
  console.log(productDetails);

  return res.status(200).json({
    status: "success",
    message: "Success message",
  });
};

module.exports = {
  getAllProducts,
  addProduct,
};
