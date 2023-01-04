const express = require("express");
const brandsControllers = require("./brands.controller");
const router = express.Router();

router.get("/getAllBlacklistBrands", brandsControllers.getAllBlacklistBrands);
router.get(
  "/getBlacklistBrandsByName",
  brandsControllers.getBlacklistBrandByName
);
router.post("/addBrand", brandsControllers.addBrand);

module.exports = router;
