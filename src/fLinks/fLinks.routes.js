const express = require("express");
const fLinksControllers = require("./fLinks.controller");
const router = express.Router();

router.get("/getAllFLinks", fLinksControllers.getAllFLinks);
router.post("/addFLink", fLinksControllers.addFLink);
router.delete("/deleteFLink", fLinksControllers.deleteFLink);
router.patch("/editFLink", fLinksControllers.editFLink);

module.exports = router;
