const addSavedSearchToDatabase =
  (SavedSearches) =>
  async ({ savedSearchTerm, savedSearchUrl, tunnelVisionAvg }) => {
    console.log(savedSearchTerm, savedSearchUrl, tunnelVisionAvg);
  };

module.exports = (SavedSearches) => {
  return {
    addSavedSearchToDatabase: addSavedSearchToDatabase(SavedSearches),
  };
};
