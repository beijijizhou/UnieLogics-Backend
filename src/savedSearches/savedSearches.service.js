const { randomUUID } = require("crypto");
const helpers = require("../_helpers/utils");
const dayjs = require("dayjs");

const addSavedSearchToDatabase =
  (SavedSearches) =>
  async ({ email, savedSearchTerm, savedSearchUrl, tunnelVisionAvg }) => {
    const currentUserWithSavedSearches = await SavedSearches.findOne({ email });

    let existingSearchUrl = [];

    if (currentUserWithSavedSearches) {
      existingSearchUrl = currentUserWithSavedSearches?.savedSearches.filter(
        (sSearch) => sSearch.savedSearchUrl === savedSearchUrl
      );
    }
    if (existingSearchUrl.length) {
      return {
        status: "error",
        message: "This search is already saved in your account",
      };
    } else if (!currentUserWithSavedSearches) {
      new SavedSearches({
        email,
        savedSearches: [
          {
            _id: randomUUID(),
            savedSearchTerm,
            savedSearchUrl,
            tunnelVisionAvg,
            dateAdded: dayjs().format(),
          },
        ],
      }).save();
    } else {
      updateObj = {
        email: email,
        savedSearches: [
          ...currentUserWithSavedSearches.savedSearches,
          {
            _id: randomUUID(),
            savedSearchTerm,
            savedSearchUrl,
            tunnelVisionAvg,
            dateAdded: dayjs().format(),
          },
        ],
      };

      await SavedSearches.findOneAndUpdate({ email }, updateObj);
    }
  };

const getAllSavedSearchesForEmailFromDB =
  (SavedSearches) =>
  async ({ email }) => {
    return await SavedSearches.findOne({ email });
  };

const deleteSpecificSavedSearchDB =
  (SavedSearches) =>
  async ({ email, _id }) => {
    const userWithSavedSearches = await SavedSearches.findOne({ email });
    let savedSearches = userWithSavedSearches.savedSearches;

    savedSearches = helpers.removeObjectWithId(savedSearches, _id);

    if (savedSearches === "no_object_with_id") {
      return {
        status: "error",
        message: `There is no object with id ${_id}`,
      };
    }
    const updateObj = {
      ...userWithSavedSearches,
      savedSearches,
    };

    await SavedSearches.findOneAndUpdate({ email }, updateObj);

    return await SavedSearches.findOne({ email });
  };

module.exports = (SavedSearches) => {
  return {
    addSavedSearchToDatabase: addSavedSearchToDatabase(SavedSearches),
    getAllSavedSearchesForEmailFromDB:
      getAllSavedSearchesForEmailFromDB(SavedSearches),
    deleteSpecificSavedSearchDB: deleteSpecificSavedSearchDB(SavedSearches),
  };
};
