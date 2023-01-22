const FLinksService = require("../fLinks");

const getAllFLinks = async (req, res) => {
  const fLinks = await FLinksService.getAllFLinks();

  if (fLinks) {
    res.status(200).json({
      items: fLinks,
    });
  } else {
    res.status(400).json({
      message: "Bad request",
    });
  }
};

const addFLink = async (req, res) => {
  const { name, link } = req.body;

  if (!link || !name) {
    return res.status(400).json({
      status: "error",
      message:
        "Please provide the name and the link in order to add them to the database.",
    });
  }

  try {
    const addedFLinks = await FLinksService.addFLinkToDatabase({
      name,
      link,
    });

    return res.status(200).json({
      status: "success",
      message: `Successfully added feedback link to the database!`,
      addedFLinks,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const deleteFLink = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      status: "error",
      message: "Please provide the feedback link name that you want to delete",
    });
  }

  try {
    await FLinksService.deleteOneFLink({ name: name.toLowerCase() });

    return res.status(200).json({
      status: "success",
      message: `Successfully deleted fLink ${name}`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const editFLink = async (req, res) => {
  const { _id, newValue } = req.body;
  if (!_id && !newValue) {
    return res.status(400).json({
      status: "error",
      message:
        "Please provide _id and value of that fLink that you want to edit.",
    });
  }

  try {
    const editedFLink = await FLinksService.findAndEditFLink({
      _id,
      newValue,
    });
    return res.status(200).json({
      status: "success",
      message: `Successfully edited brand ${newValue}`,
      editedFLink,
    });
  } catch (e) {
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  getAllFLinks,
  addFLink,
  deleteFLink,
  editFLink,
};
