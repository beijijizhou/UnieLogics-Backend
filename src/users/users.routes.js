const express = require("express");
const userControllers = require("./users.controller");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const googleLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

router.get("/getAll", userControllers.getAllUsers);
router.post("/forgotPassword", userControllers.forgotPassword);
router.post("/resetPassword", userControllers.resetPassword);
router.get("/checkAuthentication", userControllers.checkAuthentication);
router.post("/register", userControllers.register);
router.post("/login", userControllers.login);
router.post("/googleLogin", googleLoginLimiter, userControllers.googleLogin);
router.post("/checkout", userControllers.checkout);
router.post("/profileUpdate", userControllers.profileUpdate);
router.get("/profile", userControllers.profile);
router.post("/billing", userControllers.billing);
router.get("/salesPerMonth", userControllers.getSalesPerMonth);
router.post("/updateSalesPerMonth", userControllers.updateSalesPerMonth);
router.post("/survey", userControllers.postSurvey);
router.get("/profileBasedOnEmail", userControllers.simpleProfile);
router.delete("/delete", userControllers.deleteUser);

module.exports = router;
