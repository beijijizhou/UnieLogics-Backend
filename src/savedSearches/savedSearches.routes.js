const express = require("express");
const savedSearchesControllers = require("./savedSearches.controller");
const router = express.Router();

router.post("/add", savedSearchesControllers.addSavedSearch);
router.get("/getAll", savedSearchesControllers.getAllSavedSearches);

module.exports = router;
