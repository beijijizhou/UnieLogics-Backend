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
  const { email, productsDetails } = req.body;
  let userWithProducts = await ProductService.findUserWithProducts(email);

  console.log(userWithProducts);
  console.log(productsDetails);

  if (!email || !productsDetails || !productsDetails.asin) {
    return res.status(400).json({
      status: "error",
      message:
        "Asin or Email was not present in the request and it is a mandatory field!",
    });
  }

  try {
    const user = await ProductService.getUserByEmail(email.toLowerCase());
    console.log(
      `We searched for existing user with products with email ${email} and the user is ${user}`
    );
    if (!user) {
      const newUserWithProductsCreated =
        await ProductService.addUserWithProductIfNoUser({
          email,
          asin: productsDetails.asin,
          url: productsDetails.url || "",
          image: productsDetails.image || "",
          price: productsDetails.price || "",
        });

      if (newUserWithProductsCreated) {
        console.log(
          `Successfully saved a new pair of user +  product and the value is ${newUserWithProductsCreated}`
        );
        return res.status(200).json({
          status: "success",
          message: `Successfully saved a new pair of user +  product and the value is ${newUserWithProductsCreated}`,
        });
      } else {
        console.log(
          `Something went wrong with creation of a new pair of user + product and the newUserWithProductsCreated value is ${newUserWithProductsCreated}`
        );
        return res.status(400).json({
          status: "error",
          message: `Something went wrong with creation of a new pair of user + product and the newUserWithProductsCreated value is ${newUserWithProductsCreated}`,
        });
      }
    }
    return res.status(200).json({
      status: "success",
      message: "Success message",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
};
