const dayjs = require("dayjs");

const getAllFLinks = (FLink) => async () => {
  return await FLink.find();
};

const addFLinkToDatabase =
  (FLinks) =>
  async ({ name, link }) => {
    const fLinkInDB = await FLinks.findOne({ name });

    if (!fLinkInDB) {
      new FLinks({
        name: name.toString().toLowerCase(),
        link: link.toString().toLowerCase(),
        fLinkDateAdded: dayjs().format(),
        fLinkDateModified: dayjs().format(),
      }).save();
    }
  };

const deleteOneFLink =
  (FLink) =>
  async ({ name }) => {
    return await FLink.deleteOne({ name });
  };

const findAndEditFLink =
  (FLink) =>
  async ({ _id, newValue }) => {
    const filter = { _id };
    const update = { link: newValue };
    await FLink.findOneAndUpdate(filter, update);
    return await FLink.findOne(filter);
  };

module.exports = (FLink) => {
  return {
    getAllFLinks: getAllFLinks(FLink),
    addFLinkToDatabase: addFLinkToDatabase(FLink),
    deleteOneFLink: deleteOneFLink(FLink),
    findAndEditFLink: findAndEditFLink(FLink),
  };
};
