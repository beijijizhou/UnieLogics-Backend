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

const getProductsBasedOnEmail = async (req, res) => {
  const { email } = req.query;

  console.log(email);

  if (!email) {
    console.log("No email has been provided!");

    return res.status(400).json({
      status: "errror",
      message: "Email address must be provided to return a set of products",
    });
  }

  try {
    const userWithProducts = await ProductService.getUserByEmail(
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

const addProduct = async (req, res) => {
  const { email, productsDetails } = req.body;

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
      `We searched for existing user with products with email ${email} and the full details for user are ${user}`
    );
    if (!user) {
      const newUserWithProductsCreated =
        await ProductService.addUserWithProductIfNoUser({
          email,
          productsDetails,
        });

      if (newUserWithProductsCreated) {
        console.log(
          `Successfully saved a new pair of user +  product and the value is ${newUserWithProductsCreated}`
        );
        return res.status(200).json({
          status: "success",
          message: `Successfully added product ${newUserWithProductsCreated.productsDetails[0].asin}`,
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
    } else {
      const updatedUserWithProducts =
        await ProductService.updateProductsForSpecificUser({
          email,
          productsDetails,
        });

      console.log(
        `Response from inserting a product to an existing user is ${updatedUserWithProducts}`
      );

      return res.status(200).json({
        status: updatedUserWithProducts.status,
        message: updatedUserWithProducts.message,
        productsLeft: updatedUserWithProducts.productsLeft,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  getProductsBasedOnEmail,
};
