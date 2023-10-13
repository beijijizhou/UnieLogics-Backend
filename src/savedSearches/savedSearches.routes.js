const express = require("express");
const savedSearchesControllers = require("./savedSearches.controller");
const router = express.Router();

router.post("/add", savedSearchesControllers.addSavedSearch);

module.exports = router;
