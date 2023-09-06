const helpers = require("../_helpers/utils");

const findFoldersByEmail = (Folder) => async (email) => {
  return await Folder.findOne({ email });
};

const addUserWithFoldersIfNoUser =
  (Folder) =>
  ({ email, folderName, folderColor }) => {
    const userWithFolders = new Folder({
      email,
      folders: [
        {
          folderName,
          folderItems: [],
          folderItemsCount: 0,
          folderColor,
        },
      ],
    });
    return userWithFolders.save();
  };

const addFoldersToExistingUser =
  (Folder) =>
  async ({ email, updateObj }) => {
    return await Folder.findOneAndUpdate({ email }, updateObj);
  };

const deleteFoldersForExistingUser =
  (Folder) =>
  async ({ email, folderId }) => {
    const userWithFolders = await Folder.findOne({ email });
    let folders = userWithFolders.folders;

    folders = helpers.removeObjectWithId(folders, folderId);

    if (folders === "no_object_with_id") {
      return {
        status: "error",
        message: `There is no object with id ${folderId}`,
      };
    }
    const updateObj = {
      ...userWithFolders,
      folders,
    };

    await Folder.findOneAndUpdate({ email }, updateObj);

    return await Folder.findOne({ email });
  };

const editFolderNameForExistingUser =
  (Folder) =>
  async ({ email, folderId, folderName }) => {
    const userWithFolders = await Folder.findOne({ email });
    let folderExists = false;
    let folderNameIsAlreadyTheSame = false;
    const updateFolderList = userWithFolders.folders.map((folder) => {
      if (JSON.stringify(folder._id) === JSON.stringify(folderId)) {
        if (folder.folderName === folderName) {
          folderNameIsAlreadyTheSame = true;
        } else {
          folderExists = true;
          folder.folderName = folderName;
        }
      }
      return folder;
    });

    if (folderNameIsAlreadyTheSame) {
      return {
        status: "error",
        message:
          "The provided name is already the same with the existing folder name.",
      };
    }
    if (!folderExists) {
      return {
        status: "error",
        message: "There is no folder with this id.",
      };
    }

    updateObj = {
      ...userWithFolders,
      folders: [...updateFolderList],
    };
    await Folder.findOneAndUpdate({ email }, updateObj);

    return await Folder.findOne({ email });
  };

module.exports = (Folders) => {
  return {
    findFoldersByEmail: findFoldersByEmail(Folders),
    addUserWithFoldersIfNoUser: addUserWithFoldersIfNoUser(Folders),
    addFoldersToExistingUser: addFoldersToExistingUser(Folders),
    deleteFoldersForExistingUser: deleteFoldersForExistingUser(Folders),
    editFolderNameForExistingUser: editFolderNameForExistingUser(Folders),
  };
};
