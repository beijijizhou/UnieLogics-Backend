const dayjs = require("dayjs");

const getMaxItems = (WhOwners) => async () => {
  const allItems = await WhOwners.find();

  return allItems.length;
};

const getAllWhOwners = (WhOwners) => async (page, itemsPerPage) => {
  return await WhOwners.find()
    .sort("name")
    .skip((parseInt(page) - 1) * parseInt(itemsPerPage))
    .limit(parseInt(itemsPerPage));
};

const addWhOwnerToDatabase =
  (WhOwners) =>
  async ({ whOwner }) => {
    new WhOwners({
      email: whOwner.email,
      wharehouses: [
        {
          dateAdded: dayjs().format(),
          dateModified: dayjs().format(),
          name: whOwner.name.toString().toLowerCase(),
          email: whOwner.email,
          phoneNumber: whOwner.phoneNumber,
          llcName: whOwner.llcName,
          businessName: whOwner.businessName,
          businessAddress: {
            address: whOwner.businessAddress.address,
            state: whOwner.businessAddress.state,
            city: whOwner.businessAddress.city,
            zipCode: whOwner.businessAddress.zipCode,
          },
          businessPhoneNumber: whOwner.businessPhoneNumber,
          customerServiceEmailAddress: whOwner.customerServiceEmailAddress,
          costPerItemLabeling: whOwner.costPerItemLabeling,
          costPerBoxClosing: whOwner.costPerBoxClosing,
          costPerBox: whOwner.costPerBox.map((costPerBox) => {
            return {
              type: costPerBox.type,
              name: costPerBox.name,
              price: costPerBox.price,
              size: {
                width: costPerBox.size.width,
                height: costPerBox.size.height,
                length: costPerBox.size.length,
              },
            };
          }),
          handleShrink: {
            small: { price: whOwner.handleShrink.small.price },
            medium: { price: whOwner.handleShrink.medium.price },
            large: { price: whOwner.handleShrink.large.price },
          },

          handleHazmat: {
            answer: whOwner.handleHazmat.answer,
            pricePerItem: whOwner.handleHazmat.pricePerItem,
          },
          bubbleWrapping: {
            answer: whOwner.bubbleWrapping.answer,
            pricePerItem: whOwner.bubbleWrapping.pricePerItem,
          },
          offerStorage: {
            answer: whOwner.offerStorage.answer,
            pricePerPalet: whOwner.offerStorage.pricePerPalet,
            pricePerCubicFeet: whOwner.offerStorage.pricePerCubicFeet,
          },
        },
      ],
    }).save();
  };

const deleteOneBrand =
  (WhOwners) =>
  async ({ whOwner }) => {
    return await WhOwners.deleteOne({ name: whOwner });
  };

const findAndEditWhOwner =
  (WhOwners) =>
  async ({ _id, newValue }) => {
    const filter = { _id };
    const update = { name: newValue };
    await WhOwners.findOneAndUpdate(filter, update);
    return await WhOwners.findOne(filter);
  };

const searchForWhOwners = (WhOwners) => async (searchTerm) => {
  const term = new RegExp(searchTerm, "i");
  return await WhOwners.find({ name: { $regex: term } });
};

module.exports = (WhOwners) => {
  return {
    getMaxItems: getMaxItems(WhOwners),
    getAllWhOwners: getAllWhOwners(WhOwners),
    addWhOwnerToDatabase: addWhOwnerToDatabase(WhOwners),
    deleteOneBrand: deleteOneBrand(WhOwners),
    findAndEditWhOwner: findAndEditWhOwner(WhOwners),
    searchForWhOwners: searchForWhOwners(WhOwners),
  };
};
