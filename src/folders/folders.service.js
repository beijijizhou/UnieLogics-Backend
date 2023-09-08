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

const addProductToSpecificFolder =
  (Folder) =>
  async ({ email, date, title, asin, price, imageUrl, folderId }) => {
    const userWithFolders = await Folder.findOne({ email });
    let productAlreadyAdded = false;
    let folderWithIdFound = false;

    if (!userWithFolders) {
      return {
        status: "error",
        message: "The email provided doesn't match with the one with folders!",
      };
    }

    const updateSpecificFolderWithProduct = userWithFolders.folders.map(
      (folder) => {
        if (JSON.stringify(folder.id) === JSON.stringify(folderId)) {
          folderWithIdFound = true;
          if (folder.folderItems.length === 0) {
            folder.folderItems.push({
              date,
              title,
              asin,
              price,
              imageUrl,
              folderId,
            });

            folder.folderItemsCount = folder.folderItems.length;
          } else {
            folder.folderItems.map((item) => {
              if (item.asin === asin) {
                productAlreadyAdded = true;
              }
            });
            if (!productAlreadyAdded) {
              folder.folderItems.push({
                date,
                title,
                asin,
                price,
                imageUrl,
                folderId,
              });

              folder.folderItemsCount = folder.folderItems.length;
            }
          }
        }
        return folder;
      }
    );

    if (productAlreadyAdded) {
      return {
        status: "error",
        message:
          "This product already exists in this folder. You can only add it in a new folder. ",
      };
    }

    if (!folderWithIdFound) {
      return {
        status: "error",
        message:
          "The specified folder doesn't exist or there is an error with it. Please default or choice a new one.",
      };
    }

    const updateObj = {
      ...userWithFolders,
      folders: {
        ...updateSpecificFolderWithProduct,
      },
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
    addProductToSpecificFolder: addProductToSpecificFolder(Folders),
  };
};
