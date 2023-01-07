const express = require("express");
const brandsControllers = require("./brands.controller");
const router = express.Router();

router.get("/getAllBlacklistBrands", brandsControllers.getAllBlacklistBrands);
router.get(
  "/getBlacklistBrandsByName",
  brandsControllers.getBlacklistBrandByName
);
router.post("/addBrand", brandsControllers.addBrand);
router.delete("/deleteBrand", brandsControllers.deleteBrand);

module.exports = router;
