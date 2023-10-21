const express = require("express");
const wOwnersControllers = require("./wOwners.controller");
const router = express.Router();

router.post("/add", wOwnersControllers.add);
router.get("/getAll", wOwnersControllers.getAll);

module.exports = router;
