const express = require("express");
const foldersControllers = require("./folders.controller");
const router = express.Router();

router.get("/getFolders", foldersControllers.getAllFoldersForSpecificUser);
router.post("/addFolder", foldersControllers.addFolder);

module.exports = router;
