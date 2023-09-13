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
    console.log(
      "No  EMAIL or FOLDER ID has been provided, so we don't know what to delete!"
    );
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

    console.log("DELETE FOLDER RESPONSE, ", updatedFoldersForUserResponse);

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

    console.log("EDIT FOLDER NAME RESPONSE " + editFolderNameResponse);

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

module.exports = {
  getAllFoldersForSpecificUser,
  addFolder,
  deleteFolder,
  editFolderName,
  addProductToFolder,
  deleteItemFromFolder,
  editDefaultFolder,
};
