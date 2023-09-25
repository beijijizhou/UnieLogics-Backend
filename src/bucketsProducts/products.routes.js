const express = require("express");
const productControllers = require("./products.controller");
const router = express.Router();

// router.get("/getAll", productControllers.getAllProducts);
router.get("/getProducts", productControllers.getProductsBasedOnEmail);
router.post("/addProduct", productControllers.addProduct);
router.post("/delete", productControllers.deleteProduct);

module.exports = router;
