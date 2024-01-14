const express = require("express");
const wPaymentControllers = require("./wPayment.controller");
const router = express.Router();

router.post("/paymentIntent", wPaymentControllers.createPaymentIntent);
router.post("/confirmPayment", wPaymentControllers.confirmPayment);

module.exports = router;
