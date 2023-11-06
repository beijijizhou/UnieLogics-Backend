const express = require("express");
const shipmentPlanControllers = require("./shipmentPlan.controller");
const router = express.Router();

router.post("/add", shipmentPlanControllers.add);
router.get("/getAll", shipmentPlanControllers.getAll);
router.get("/getById", shipmentPlanControllers.getById);
router.delete("/delete", shipmentPlanControllers.deleteShipmentPlan);

module.exports = router;
