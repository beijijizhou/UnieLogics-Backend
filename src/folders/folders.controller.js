const FolderService = require(".");

const getAllFoldersForSpecificUser = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    res.status(400).json({
      status: "error",
      message: "There was an error finding folders for this email",
    });
  }
  try {
    const folders = await FolderService.findFoldersByEmail(email.toLowerCase());
    if (folders) {
      res.status(200).json({
        status: "success",
        response: folders,
      });
    } else {
      // add default folder to users if there are no folders
      await FolderService.addUserWithFoldersIfNoUser({
        email: email.toLowerCase(),
        folderName: "Default",
        folderColor: "#d89c00",
      });
      const foldersAfterDefault = await FolderService.findFoldersByEmail(
        email.toLowerCase()
      );
      res.status(200).json({
        status: "success",
        response: foldersAfterDefault,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const addFolder = async (req, res) => {
  const { folderName, email, folderColor } = req.body;
  let folderNameAlreadyExists = false;

  if (!folderName || !email || !folderColor) {
    return res.status(400).json({
      status: "error",
      message:
        "You need to provide a folder name and the email address in order to add it.",
    });
  }
  try {
    const userWithFolders = await FolderService.findFoldersByEmail(
      email.toLowerCase()
    );
    if (!userWithFolders) {
      const newUserWithFoldersCreated =
        await FolderService.addUserWithFoldersIfNoUser({
          email: email.toLowerCase(),
          folderName,
          folderColor,
        });

      if (newUserWithFoldersCreated) {
        console.log(
          `Successfully saved a new pair of user + folder and the value is ${newUserWithFoldersCreated}`
        );
        return res.status(200).json({
          status: "success",
          message: `Successfully added folder to user ${email}`,
        });
      } else {
        console.log(
          `Something went wrong with creation of a new pair of user + folder and the newUserWithFoldersCreated value is ${newUserWithFoldersCreated}`
        );
        return res.status(400).json({
          status: "error",
          message: `Something went wrong with creation of a new pair of user + folder and the newUserWithFoldersCreated value is ${newUserWithFoldersCreated}`,
        });
      }
    } else {
      userWithFolders.folders.map((folder) => {
        if (folder.folderName === folderName) {
          folderNameAlreadyExists = true;
        }
      });
      if (folderNameAlreadyExists) {
        return res.status(409).json({
          status: "error",
          message: "There is already a folder with this name.",
        });
      } else {
        const updateObj = {
          folders: [
            ...userWithFolders.folders,
            { folderName, folderItems: [], folderColor },
          ],
        };

        await FolderService.addFoldersToExistingUser({ email, updateObj });
        const newlyAddedFolderToList = await FolderService.findFoldersByEmail(
          email.toLowerCase()
        );
        return res.status(200).json({
          status: "success",
          message: `Successfully added a new folder with name: ${folderName} to user ${email}`,
          response: newlyAddedFolderToList || [],
        });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const deleteFolder = async (req, res) => {
  const { folderId, email } = req.body;
  if (!email || !folderId) {
    console.log("Received on delete folder", { email, folderId });

    return res.status(400).json({
      status: "error",
      message: "Email and folderId must be provided to retrieve data.",
    });
  }
  try {
    const updatedFoldersForUserResponse =
      await FolderService.deleteFoldersForExistingUser({
        email: email.toLowerCase(),
        folderId,
      });

    console.log("Delete folder response is ", updatedFoldersForUserResponse);

    if (!updatedFoldersForUserResponse) {
      return res.status(403).json({
        status: "error",
        message: `There was an error processing the delete request`,
      });
    }
    if (updatedFoldersForUserResponse.status === "error") {
      return res.status(403).json({
        ...updatedFoldersForUserResponse,
      });
    }
    return res.status(200).json({
      status: "success",
      response: updatedFoldersForUserResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const editFolderName = async (req, res) => {
  const { folderName, folderId, email } = req.body;
  if (!folderName || !folderId || !email) {
    return res.status(400).json({
      status: "error",
      message: "There was an error editing your folder.",
    });
  }
  try {
    const editFolderNameResponse =
      await FolderService.editFolderNameForExistingUser({
        email,
        folderId,
        folderName,
      });

    console.log("Edit folder response is " + editFolderNameResponse);

    if (editFolderNameResponse.status === "error") {
      return res.status(403).json(editFolderNameResponse);
    }

    res.status(200).json({
      status: "success",
      response: editFolderNameResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const addProductToFolder = async (req, res) => {
  const { title, asin, price, imageUrl, folderId, email } = req.body;

  if (!folderId) {
    return res.status(403).json({
      status: "error",
      message:
        "There was an error adding product to folder. You need to specify a folder or set a default one from the platform!",
    });
  }

  if (!title || !asin || !imageUrl || !email) {
    return res.status(403).json({
      status: "error",
      message:
        "There was an error adding product to folder. Title, asin, price, email and imageUrl are required!",
    });
  }

  try {
    const addProductToFolderResponse =
      await FolderService.addProductToSpecificFolder({
        email,
        date: new Date(),
        title,
        asin,
        price,
        imageUrl,
        folderId,
      });
    console.log(
      "Add Product to folder response is " + addProductToFolderResponse
    );

    if (addProductToFolderResponse.status === "error") {
      return res.status(400).json({
        ...addProductToFolderResponse,
      });
    }

    res.status(200).json({
      status: "success",
      response: addProductToFolderResponse,
      message: "Successfully added product to folder!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const deleteItemFromFolder = async (req, res) => {
  const { email, folderId, folderItemId } = req.body;
  console.log("Received on delete item from folder", {
    email,
    folderId,
    folderItemId,
  });

  if (!email || !folderId) {
    return res.status(403).json({
      status: "error",
      message: "The email, folderId and folderItemId are mandatory",
    });
  }

  if (!folderItemId) {
    return res.status(403).json({
      status: "error",
      message: "Please select an item to be deleted.",
    });
  }

  try {
    const deleteItemFromFolderResponse =
      await FolderService.deleteItemFromExistingFolder({
        email,
        folderId,
        folderItemId,
      });

    console.log(
      "Delete item from folder response is ",
      deleteItemFromFolderResponse
    );

    if (deleteItemFromFolderResponse.status === "error") {
      return res.status(400).json({
        ...deleteItemFromFolderResponse,
      });
    }
    res.status(200).json({
      status: "success",
      response: deleteItemFromFolderResponse,
      message: "Successfully deleted item from folder!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const editDefaultFolder = async (req, res) => {
  const { email, folderId, folderSelected } = req.body;
  console.log("Received from EDIT FOLDER DEFAUL ", {
    email,
    folderId,
    folderSelected,
  });
  if (!email || !folderId || !folderSelected) {
    return res.status(403).json({
      status: "error",
      message: "There was an error changing the default folder.",
    });
  }

  try {
    const editDefaultFolderResponse =
      await FolderService.editDefaultFolderForUser({
        email,
        folderId,
        folderSelected,
      });

    console.log("Edit Default folder response is", editDefaultFolderResponse);

    res.status(200).json({
      status: "success",
      message: "Successfullt updated default folder.",
      response: editDefaultFolderResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const updateSupplierForItemInFolder = async (req, res) => {
  const {
    folderId,
    productId,
    _id,
    supplierName,
    supplierAddress,
    supplierLink,
    contactPerson,
  } = req.body;
  const missingFields = [];

  if (!folderId) missingFields.push("folderId");
  if (!productId) missingFields.push("productId");
  if (!_id) missingFields.push("_id");
  if (!supplierName) missingFields.push("supplierName");
  if (!supplierAddress) missingFields.push("supplierAddress");
  if (!supplierAddress?.street) missingFields.push("supplierAddress?.street");
  if (!supplierAddress?.city) missingFields.push("supplierAddress?.city");
  if (!supplierAddress?.state) missingFields.push("supplierAddress?.state");
  if (!supplierAddress?.zipCode) missingFields.push("supplierAddress?.zipCode");
  if (!supplierLink) missingFields.push("supplierLink");
  if (!contactPerson) missingFields.push("contactPerson");
  if (!contactPerson?.name) missingFields.push("contactPerson?.name");
  if (!contactPerson?.email) missingFields.push("contactPerson?.email");
  if (!contactPerson?.phoneNumber)
    missingFields.push("contactPerson?.phoneNumber");
  if (!contactPerson?.extensionCode)
    missingFields.push("contactPerson?.extensionCode");

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }
  try {
    const updateSupplierForItemResponse =
      await FolderService.updateSupplierForItem({
        folderId,
        productId,
        _id,
        supplierName,
        supplierAddress,
        supplierLink,
        contactPerson,
      });

    if (updateSupplierForItemResponse?.status === "error") {
      return res.status(403).json({
        ...updateSupplierForItemResponse,
      });
    }
    res.status(200).json({
      status: "success",
      message: `Successfullt updated supplier for item ${productId}`,
      response: updateSupplierForItemResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  getAllFoldersForSpecificUser,
  addFolder,
  deleteFolder,
  editFolderName,
  addProductToFolder,
  deleteItemFromFolder,
  editDefaultFolder,
  updateSupplierForItemInFolder,
};
