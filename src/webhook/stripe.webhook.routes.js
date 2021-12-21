const express = require("express");
const stripeWebhook = require("./stripe.webhook");
const router = express.Router();

router.post("/", stripeWebhook.stripeWebhook);

module.exports = router;
