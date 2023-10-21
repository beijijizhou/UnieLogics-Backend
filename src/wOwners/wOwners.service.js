const dayjs = require("dayjs");

const addWOwnerToDatabase =
  (WOwners) =>
  async ({ wOwner }) => {
    new WOwners({
      email: wOwner.email,
      warehouses: [
        {
          dateAdded: dayjs().format(),
          dateModified: dayjs().format(),
          name: wOwner.name.toString().toLowerCase(),
          email: wOwner.email,
          phoneNumber: wOwner.phoneNumber,
          llcName: wOwner.llcName,
          businessName: wOwner.businessName,
          businessAddress: {
            address: wOwner.businessAddress.address,
            state: wOwner.businessAddress.state,
            city: wOwner.businessAddress.city,
            zipCode: wOwner.businessAddress.zipCode,
          },
          businessPhoneNumber: wOwner.businessPhoneNumber,
          customerServiceEmailAddress: wOwner.customerServiceEmailAddress,
          costPerItemLabeling: wOwner.costPerItemLabeling,
          costPerBoxClosing: wOwner.costPerBoxClosing,
          costPerBox: wOwner.costPerBox.map((costPerBox) => {
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
            small: { price: wOwner.handleShrink.small.price },
            medium: { price: wOwner.handleShrink.medium.price },
            large: { price: wOwner.handleShrink.large.price },
          },

          handleHazmat: {
            answer: wOwner.handleHazmat.answer,
            pricePerItem: wOwner.handleHazmat.pricePerItem,
          },
          bubbleWrapping: {
            answer: wOwner.bubbleWrapping.answer,
            pricePerItem: wOwner.bubbleWrapping.pricePerItem,
          },
          offerStorage: {
            answer: wOwner.offerStorage.answer,
            pricePerPalet: wOwner.offerStorage.pricePerPalet,
            pricePerCubicFeet: wOwner.offerStorage.pricePerCubicFeet,
          },
        },
      ],
    }).save();
  };

const getAllWOwnersFromDB = (WOwners) => async () => {
  return await WOwners.find();
};

module.exports = (WOwners) => {
  return {
    addWOwnerToDatabase: addWOwnerToDatabase(WOwners),
    getAllWOwnersFromDB: getAllWOwnersFromDB(WOwners),
  };
};
