const express = require("express");
const suppliersControllers = require("./suppliers.controller");
const router = express.Router();

router.post("/add", suppliersControllers.add);
router.get("/getAll", suppliersControllers.getAll);

module.exports = router;
