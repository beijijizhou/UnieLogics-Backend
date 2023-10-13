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
        savedSearches: [{ savedSearchTerm, savedSearchUrl, tunnelVisionAvg }],
      }).save();
    } else {
      updateObj = {
        email: email,
        savedSearches: [
          ...currentUserWithSavedSearches.savedSearches,
          {
            savedSearchTerm,
            savedSearchUrl,
            tunnelVisionAvg,
          },
        ],
      };

      const updateSavedSearchesForExistingUser =
        await SavedSearches.findOneAndUpdate({ email }, updateObj);
    }
  };

module.exports = (SavedSearches) => {
  return {
    addSavedSearchToDatabase: addSavedSearchToDatabase(SavedSearches),
  };
};
