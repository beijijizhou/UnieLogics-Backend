const express = require("express");
const foldersControllers = require("./folders.controller");
const router = express.Router();

router.get("/get", foldersControllers.getAllFoldersForSpecificUser);
router.post("/add", foldersControllers.addFolder);
router.delete("/delete", foldersControllers.deleteFolder);
router.put("/update", foldersControllers.editFolderName);
router.post("/addToFolder", foldersControllers.addProductToFolder);
router.delete("/itemFromFolder", foldersControllers.deleteItemFromFolder);
router.put("/editDefault", foldersControllers.editDefaultFolder);
router.put(
  "/updateSupplierForItemInFolder",
  foldersControllers.updateSupplierForItemInFolder
);

module.exports = router;
