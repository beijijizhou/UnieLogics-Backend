const express = require("express");
const userControllers = require("./users.controller");
const router = express.Router();

router.get("/getAll", userControllers.getAllUsers);
router.get("/forgotPassword", userControllers.forgotPassword);
router.get("/checkAuthentication", userControllers.checkAuthentication);
router.post("/register", userControllers.register);
router.post("/login", userControllers.login);
router.post("/checkout", userControllers.checkout);
router.post("/profileUpdate", userControllers.profileUpdate);
router.get("/profile", userControllers.profile);
router.post("/billing", userControllers.billing);
router.get("/salesPerMonth", userControllers.getSalesPerMonth);
router.post("/updateSalesPerMonth", userControllers.updateSalesPerMonth);
router.post("/survey", userControllers.postSurvey);
router.get("/profileBasedOnEmail", userControllers.simpleProfile);
router.patch('/:id/customerId', userControllers.updateUserCustomerId);
router.patch('/:id/vendorId', userControllers.updateUserVendorId);
router.patch('/:id/warehouseId', userControllers.updateUserWarehouseId);
router.patch('/:id/records', userControllers.updateUserRecords);

module.exports = router;
