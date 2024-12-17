const express = require("express");
const shipmentPlanControllers = require("./shipmentPlan.controller");
const router = express.Router();

router.post("/add", shipmentPlanControllers.add);
router.get("/getAll", shipmentPlanControllers.getAll);
router.get("/getById", shipmentPlanControllers.getById);
router.put("/update", shipmentPlanControllers.updateShipmentPlan);
router.put("/update-payment-status", shipmentPlanControllers.updatePaymentStatus);
router.post("/upload-files", shipmentPlanControllers.uploadShipmentPlanFiles);
router.delete("/delete", shipmentPlanControllers.deleteShipmentPlan);
router.delete(
  "/delete-file",
  shipmentPlanControllers.deleteFileFromShipmentPlan
);
router.delete(
  "/deleteProduct",
  shipmentPlanControllers.deleteProductFromShipmentPlan
);

module.exports = router;
