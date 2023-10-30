const dayjs = require("dayjs");
const { randomUUID } = require("crypto");
const helpers = require("../_helpers/utils");
const UserService = require("../users");

const addWOwnerToDatabase =
  (WOwners) =>
  async ({ wOwner }) => {
    new WOwners({
      email: wOwner.email,
      warehouses: [
        {
          _id: randomUUID(),
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
            answer: wOwner.handleShrink.answer,
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

const updateWarehousesInDBForExistingOwner =
  (WOwners) =>
  async ({ wOwner }) => {
    let updateObj = {};
    const currentUserWithWarehouses = await WOwners.findOne({
      email: wOwner.email,
    });
    console.log("Warehouses for this email are:");
    console.log(currentUserWithWarehouses.warehouses);

    updateObj = {
      email: wOwner.email,
      warehouses: [
        ...currentUserWithWarehouses.warehouses,
        {
          _id: randomUUID(),
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
            answer: wOwner.handleShrink.answer,
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
    };

    return await WOwners.findOneAndUpdate({ email: wOwner.email }, updateObj);
  };

const getAllWOwnersFromDB = (WOwners) => async () => {
  return await WOwners.find();
};

const deleteWOwnerFromSpecificUser =
  (WOwners) =>
  async ({ email, _id }) => {
    const userWithWOwners = await WOwners.findOne({ email });

    if (!userWithWOwners) {
      return {
        status: "error",
        message:
          "The email and _id provided are not matching with a user with warehouse owners!",
      };
    }

    const updateWOwnersWithDeletedOne = helpers.removeObjectWithId(
      userWithWOwners.warehouses,
      _id
    );

    if (updateWOwnersWithDeletedOne === "no_object_with_id") {
      return {
        status: "error",
        message: "There is no warehouse owner with this id for this user.",
      };
    }

    if (updateWOwnersWithDeletedOne.length === 0) {
      // If there are no more warehouses, delete the user from both warehouse collections
      await WOwners.deleteOne({ email });
      const userInTheUsersCollection = await UserService.getUserByEmail(email);
      await UserService._delete(userInTheUsersCollection._id);
    } else {
      const updateObj = {
        ...userWithWOwners,
        warehouses: {
          ...updateWOwnersWithDeletedOne,
        },
      };

      await WOwners.findOneAndUpdate({ email }, updateObj);
    }

    return await WOwners.findOne({ email });
  };

const getWarehousesForThisUser =
  (WOwners) =>
  async ({ email }) => {
    return await WOwners.findOne({ email });
  };

module.exports = (WOwners) => {
  return {
    addWOwnerToDatabase: addWOwnerToDatabase(WOwners),
    getAllWOwnersFromDB: getAllWOwnersFromDB(WOwners),
    updateWarehousesInDBForExistingOwner:
      updateWarehousesInDBForExistingOwner(WOwners),
    deleteWOwnerFromSpecificUser: deleteWOwnerFromSpecificUser(WOwners),
    getWarehousesForThisUser: getWarehousesForThisUser(WOwners),
  };
};
