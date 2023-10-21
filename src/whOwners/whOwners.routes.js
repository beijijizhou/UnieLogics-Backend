const express = require("express");
const whOwnersControllers = require("./whOwners.controller");
const router = express.Router();

router.post("/add", whOwnersControllers.add);
// router.get("/getAll", whOwnersControllers.getAllBlacklistBrands);

module.exports = router;
