const findFoldersByEmail = (Folder) => async (email) => {
  return await Folder.findOne({ email });
};

const addUserWithFoldersIfNoUser =
  (Folder) =>
  ({ email, folderName }) => {
    const userWithFolders = new Folder({
      email,
      folders: [
        {
          folderName,
          folderItems: [],
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
module.exports = (Folders) => {
  return {
    findFoldersByEmail: findFoldersByEmail(Folders),
    addUserWithFoldersIfNoUser: addUserWithFoldersIfNoUser(Folders),
    addFoldersToExistingUser: addFoldersToExistingUser(Folders),
  };
};
