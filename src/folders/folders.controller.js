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
    console.log("FOLDERSSSSSSS " + folders);
    if (folders) {
      res.status(200).json({
        status: "success",
        response: folders,
      });
    } else {
      res.status(200).json({
        status: "success",
        response: {
          email,
          folders: [],
        },
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
          folders: newlyAddedFolderToList || [],
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

module.exports = {
  getAllFoldersForSpecificUser,
  addFolder,
  deleteFolder,
  editFolderName,
};
