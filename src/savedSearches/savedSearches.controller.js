const SavedSearchesService = require(".");

const addSavedSearch = async (req, res) => {
  const { savedSearchTerm, savedSearchUrl, tunnelVisionAvg } = req.body;

  if (!savedSearchTerm || !savedSearchUrl || tunnelVisionAvg.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "There was an error saving your search!",
    });
  }

  try {
    const addSavedSearchResponse =
      await SavedSearchesService.addSavedSearchToDatabase({
        savedSearchTerm,
        savedSearchUrl,
        tunnelVisionAvg,
      });

    return res.status(200).json({
      status: "success",
      message: `Successfully added Search your Saved Searches!`,
      addSavedSearchResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  addSavedSearch,
};
