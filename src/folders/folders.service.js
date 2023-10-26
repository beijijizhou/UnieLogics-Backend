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
          folderSelected: folderName === "Default" ? true : false,
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
    let folderIsDefault = false;

    userWithFolders.folders.map((folder) => {
      if (JSON.stringify(folder.id) === JSON.stringify(folderId)) {
        if (folder.folderSelected) {
          folderIsDefault = true;
        }
      }

      return folder;
    });

    if (folderIsDefault) {
      return {
        status: "error",
        message:
          "You cannot delete the default folder. Please set a new default folder and try again.",
      };
    }
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
  async ({ email, date, title, asin, price, imageUrl, folderId, supplier }) => {
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
              supplier,
            });

            folder.folderItemsCount = folder.folderItems.length;
          } else {
            folder.folderItems.map((item) => {
              if (item.asin === asin) {
                // Update the values of the item when product exists
                item.date = date;
                item.title = title;
                item.asin = asin;
                item.price = price;
                item.imageUrl = imageUrl;
                item.folderId = folderId;
                item.supplier = supplier;

                productAlreadyAdded = true;
              }
              return item;
            });
            if (!productAlreadyAdded) {
              folder.folderItems.push({
                date,
                title,
                asin,
                price,
                imageUrl,
                folderId,
                supplier,
              });

              folder.folderItemsCount = folder.folderItems.length;
            }
          }
        }
        return folder;
      }
    );

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

const deleteItemFromExistingFolder =
  (Folder) =>
  async ({ email, folderId, folderItemId }) => {
    const userWithFolders = await Folder.findOne({ email });
    let folderItems = [];

    if (!userWithFolders) {
      return {
        status: "error",
        message: "The email provided doesn't match with the one with folders!",
      };
    }

    const updateFoldersWithDeletedOne = userWithFolders.folders.map(
      (folder) => {
        if (JSON.stringify(folder.id) === JSON.stringify(folderId)) {
          if (folder.folderItems.length === 0) {
            return {
              status: "error",
              message: "There are no items in this folder.",
            };
          } else {
            folderItems = helpers.removeObjectWithId(
              folder.folderItems,
              folderItemId
            );
          }
        }

        return folder;
      }
    );

    if (folderItems === "no_object_with_id") {
      return {
        status: "error",
        message: "There is no item with this id",
      };
    }
    const updateObj = {
      ...userWithFolders,
      folders: {
        ...updateFoldersWithDeletedOne,
      },
    };

    await Folder.findOneAndUpdate({ email }, updateObj);

    return await Folder.findOne({ email });
  };

const editDefaultFolderForUser =
  (Folder) =>
  async ({ email, folderId, folderSelected }) => {
    const userWithFolders = await Folder.findOne({ email });

    if (!userWithFolders) {
      return {
        status: "error",
        message: "The email provided doesn't match with the one with folders!",
      };
    }

    const updatedFoldersAfterSettingDefaultFolder = userWithFolders.folders.map(
      (folder) => {
        if (JSON.stringify(folder.id) === JSON.stringify(folderId)) {
          folder.folderSelected = folderSelected;
        } else {
          folder.folderSelected = false;
        }

        return folder;
      }
    );
    const updateObj = {
      ...userWithFolders,
      folders: {
        ...updatedFoldersAfterSettingDefaultFolder,
      },
    };

    await Folder.findOneAndUpdate({ email }, updateObj);

    return await Folder.findOne({ email });
  };

const updateSupplierForItem =
  (Folder) =>
  async ({
    folderId,
    productId,
    _id,
    supplierName,
    supplierAddress,
    supplierLink,
    contactPerson,
  }) => {
    const filter = { "folders._id": folderId };
    const update = {
      $set: {
        "folders.$[folder].folderItems.$[item].supplier": {
          supplierName,
          supplierAddress,
          supplierLink,
          contactPerson,
          _id,
        },
      },
    };
    const options = {
      arrayFilters: [{ "folder._id": folderId }, { "item._id": productId }],
    };

    const result = await Folder.findOneAndUpdate(filter, update, options);

    if (!result) {
      return {
        status: "error",
        message: "Folder Not Found",
      };
    }

    return result;
  };

module.exports = (Folders) => {
  return {
    findFoldersByEmail: findFoldersByEmail(Folders),
    addUserWithFoldersIfNoUser: addUserWithFoldersIfNoUser(Folders),
    addFoldersToExistingUser: addFoldersToExistingUser(Folders),
    deleteFoldersForExistingUser: deleteFoldersForExistingUser(Folders),
    editFolderNameForExistingUser: editFolderNameForExistingUser(Folders),
    addProductToSpecificFolder: addProductToSpecificFolder(Folders),
    deleteItemFromExistingFolder: deleteItemFromExistingFolder(Folders),
    editDefaultFolderForUser: editDefaultFolderForUser(Folders),
    updateSupplierForItem: updateSupplierForItem(Folders),
  };
};
