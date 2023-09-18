const express = require("express");
const profProductsControllers = require("./profProductDetails.controller");
const router = express.Router();

router.post(
  "/addProfProductDetails",
  profProductsControllers.addProfProductDetails
);

module.exports = router;
