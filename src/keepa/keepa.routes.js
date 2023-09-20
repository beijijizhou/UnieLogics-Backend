const express = require("express");
const keepa = require("./keepa.controller");
const router = express.Router();

router.get("/getChartData", keepa.getChartsData);

module.exports = router;
