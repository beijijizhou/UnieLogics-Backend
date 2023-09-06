const express = require("express");
const foldersControllers = require("./folders.controller");
const router = express.Router();

router.get("/get", foldersControllers.getAllFoldersForSpecificUser);
router.post("/add", foldersControllers.addFolder);
router.delete("/delete", foldersControllers.deleteFolder);
router.post("/update", foldersControllers.editFolderName);

module.exports = router;
