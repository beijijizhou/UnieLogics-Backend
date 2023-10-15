const SavedSearchesService = require(".");

const addSavedSearch = async (req, res) => {
  const { email, savedSearchTerm, savedSearchUrl, tunnelVisionAvg } = req.body;

  if (
    !email ||
    !savedSearchTerm ||
    !savedSearchUrl ||
    tunnelVisionAvg.length === 0
  ) {
    console.log(
      "There are missing parts from email or savedSearchTerm or savedSearchUrl or tunnelVisionAvg"
    );

    return res.status(400).json({
      status: "error",
      message: "There was an error saving your search!",
    });
  }

  try {
    const addSavedSearchResponse =
      await SavedSearchesService.addSavedSearchToDatabase({
        email,
        savedSearchTerm,
        savedSearchUrl,
        tunnelVisionAvg,
      });

    if (addSavedSearchResponse?.status === "error") {
      return res.status(403).json({
        ...addSavedSearchResponse,
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully saved this search to your Saved Searches!`,
      addSavedSearchResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const getAllSavedSearches = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    res.status(400).json({
      status: "error",
      message: "There was an error saving your search!",
    });
  }

  try {
    const getAllSavedSearchesForEmailFromDBResponse =
      await SavedSearchesService.getAllSavedSearchesForEmailFromDB({ email });
    if (getAllSavedSearchesForEmailFromDBResponse) {
      return res.status(200).json({
        status: "success",
        message: "Successfully retreieved all your saved searches.",
        response: getAllSavedSearchesForEmailFromDBResponse,
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved all your saved searches.",
        response: {
          savedSearches: [],
          email,
        },
      });
    }
    console.log(getAllSavedSearchesForEmailFromDBResponse);
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  addSavedSearch,
  getAllSavedSearches,
};
