const dayjs = require("dayjs");
const { randomUUID } = require("crypto");
const helpers = require("../_helpers/utils");
const UserService = require("../users");

const addWOwnerToDatabase =
  (WOwners) =>
  async ({ wOwner }) => {
    try {
      const geoLocationObject = await helpers.getLatLongFromZipCode(
        wOwner.businessAddress.zipCode
      );

      if (
        geoLocationObject.latitude === undefined ||
        geoLocationObject.longitude === undefined
      ) {
        return {
          status: "error",
          message:
            "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
        };
      }

      new WOwners({
        email: wOwner.email,
        warehouses: [
          {
            _id: randomUUID(),
            dateAdded: dayjs().format(),
            dateModified: dayjs().format(),
            name: wOwner.name.toString().toLowerCase(),
            lobId: wOwner.lobId,
            warehouseId: wOwner.warehouseId,
            vendorId: wOwner.vendorId,
            email: wOwner.email,
            phoneNumber: wOwner.phoneNumber,
            llcName: wOwner.llcName,
            businessName: wOwner.businessName,
            businessAddress: {
              address: wOwner.businessAddress.address,
              state: wOwner.businessAddress.state,
              city: wOwner.businessAddress.city,
              zipCode: wOwner.businessAddress.zipCode,
              lat: geoLocationObject.latitude.toString(),
              long: geoLocationObject.longitude.toString(),
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
    } catch (error) {
      return {
        status: "error",
        message:
          "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
      };
    }
  };

const updateWarehousesInDBForExistingOwner =
  (WOwners) =>
  async ({ wOwner }) => {
    let updateObj = {};
    const existingWarehouse = await WOwners.findOne({
      email: wOwner.email,
      "warehouses.name": wOwner.name.toString().toLowerCase(),
      "warehouses.businessAddress.zipCode": wOwner.businessAddress.zipCode,
    });

    if (existingWarehouse) {
      return {
        status: "error",
        message:
          "Warehouse with the same name and zipCode already exists in the database.",
      };
    }

    const currentUserWithWarehouses = await WOwners.findOne({
      email: wOwner.email,
    });
    console.log("Warehouses for this email are:");
    console.log(currentUserWithWarehouses.warehouses);
    try {
      const geoLocationObject = await helpers.getLatLongFromZipCode(
        wOwner.businessAddress.zipCode
      );

      if (
        geoLocationObject.latitude === undefined ||
        geoLocationObject.longitude === undefined
      ) {
        return {
          status: "error",
          message:
            "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
        };
      }

      updateObj = {
        email: wOwner.email,
        warehouses: [
          ...currentUserWithWarehouses.warehouses,
          {
            _id: randomUUID(),
            dateAdded: dayjs().format(),
            dateModified: dayjs().format(),
            name: wOwner.name.toString().toLowerCase(),
            lobId: wOwner.lobId,
            warehouseId: wOwner.warehouseId,
            vendorId: wOwner.vendorId,
            email: wOwner.email,
            phoneNumber: wOwner.phoneNumber,
            llcName: wOwner.llcName,
            businessName: wOwner.businessName,
            businessAddress: {
              address: wOwner.businessAddress.address,
              state: wOwner.businessAddress.state,
              city: wOwner.businessAddress.city,
              zipCode: wOwner.businessAddress.zipCode,
              lat: geoLocationObject.latitude.toString(),
              long: geoLocationObject.longitude.toString(),
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
    } catch (error) {
      return {
        status: "error",
        message:
          "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
      };
    }
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
