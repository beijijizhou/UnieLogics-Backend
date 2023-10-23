const express = require("express");
const shipmentPlanControllers = require("./shipmentPlan.controller");
const router = express.Router();

router.post("/add", shipmentPlanControllers.add);
router.get("/getAll", shipmentPlanControllers.getAll);

module.exports = router;
