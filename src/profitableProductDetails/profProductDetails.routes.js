const express = require("express");
const profProductsControllers = require("./profProductDetails.controller");
const router = express.Router();

router.post(
  "/addProfProductDetails",
  profProductsControllers.addProfProductDetails
);

router.get(
  "/profProductDetails",
  profProductsControllers.getProfitableProductDetails
);

module.exports = router;
