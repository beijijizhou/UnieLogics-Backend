const express = require("express");
const brandsControllers = require("./brands.controller");
const router = express.Router();

router.get("/getAllBlacklistBrands", brandsControllers.getAllBlacklistBrands);
router.post("/addToBlacklist", brandsControllers.getBlacklistBrandByName);

module.exports = router;
