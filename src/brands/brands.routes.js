const express = require("express");
const brandsControllers = require("./brands.controller");
const router = express.Router();

router.get("/getAllBlacklistBrands", brandsControllers.getAllBlacklistBrands);
router.get(
  "/getBlacklistBrandsByName",
  brandsControllers.getBlacklistBrandByName
);
router.post("/addBlacklistBrand", brandsControllers.addBlacklistBrand);
router.delete("/deleteBlacklistBrand", brandsControllers.deleteBlacklistBrand);
router.patch("/editBlacklistBrand", brandsControllers.editBlacklistBrand);

module.exports = router;
