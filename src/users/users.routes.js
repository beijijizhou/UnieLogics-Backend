const express = require("express");
const userControllers = require("./users.controller");
const router = express.Router();

router.get("/getAll", userControllers.getAllUsers);
router.get("/forgotPassword", userControllers.forgotPassword);
router.get("/checkAuthentication", userControllers.checkAuthentication);
router.post("/register", userControllers.register);
router.post("/login", userControllers.login);
router.post("/googleLogin", userControllers.googleLogin);
router.post("/checkout", userControllers.checkout);
router.post("/profileUpdate", userControllers.profileUpdate);
router.get("/profile", userControllers.profile);
router.post("/billing", userControllers.billing);
router.get("/salesPerMonth", userControllers.getSalesPerMonth);
router.post("/updateSalesPerMonth", userControllers.updateSalesPerMonth);
router.post("/survey", userControllers.postSurvey);
router.get("/profileBasedOnEmail", userControllers.simpleProfile);

module.exports = router;
