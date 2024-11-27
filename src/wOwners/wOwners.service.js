const dayjs = require("dayjs");
const { randomUUID } = require("crypto");
const helpers = require("../_helpers/utils");
const UserService = require("../users");

const addWOwnerToDatabase =
  (WOwners) =>
  async ({ wOwner }) => {
    try {
      const geoLocationObject = await helpers.getLatLongFromZipCode(wOwner.businessAddress.zipCode);

      if (geoLocationObject.latitude === undefined || geoLocationObject.longitude === undefined) {
        return {
          status: "error",
          message:
            "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
        };
      }

      new WOwners({
        email: wOwner.email.toLowerCase(),
        warehouses: [
          {
            _id: randomUUID(),
            dateAdded: dayjs().format(),
            dateModified: dayjs().format(),
            name: wOwner.name.toString().toLowerCase(),
            lobId: wOwner.lobId,
            warehouseId: wOwner.warehouseId,
            vendorId: wOwner.vendorId,
            email: wOwner.email.toLowerCase(),
            phoneNumber: wOwner.phoneNumber,
            llcName: wOwner.llcName,
            businessName: wOwner.businessName,
            itemCategories: wOwner.itemCategories,
            itemSubCategories: wOwner.itemSubCategories,
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
      email: wOwner.email.toLowerCase(),
      "warehouses.name": wOwner.name.toString().toLowerCase(),
      "warehouses.businessAddress.zipCode": wOwner.businessAddress.zipCode,
    });

    if (existingWarehouse) {
      return {
        status: "error",
        message: "Warehouse with the same name and zipCode already exists in the database.",
      };
    }

    const currentUserWithWarehouses = await WOwners.findOne({
      email: wOwner.email.toLowerCase(),
    });
    console.log("Warehouses for this email are:");
    console.log(currentUserWithWarehouses.warehouses);
    try {
      const geoLocationObject = await helpers.getLatLongFromZipCode(wOwner.businessAddress.zipCode);

      if (geoLocationObject.latitude === undefined || geoLocationObject.longitude === undefined) {
        return {
          status: "error",
          message:
            "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
        };
      }

      updateObj = {
        email: wOwner.email.toLowerCase(),
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
            email: wOwner.email.toLowerCase(),
            phoneNumber: wOwner.phoneNumber,
            llcName: wOwner.llcName,
            businessName: wOwner.businessName,
            itemCategories: wOwner.itemCategories,
            itemSubCategories: wOwner.itemSubCategories,
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

      return await WOwners.findOneAndUpdate({ email: wOwner.email.toLowerCase() }, updateObj);
    } catch (error) {
      return {
        status: "error",
        message:
          "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
      };
    }
  };

const editWarehousesInDBForExistingOwner =
  (WOwners) =>
  async ({ wOwner, warehouseId, wOwnerEmail }) => {
    let updateObj = {};
    try {
      const currentUserWithWarehouses = await WOwners.findOne({
        email: wOwnerEmail,
      });

      const warehouseIndex = currentUserWithWarehouses.warehouses.findIndex(
        (warehouse) => warehouse.warehouseId === warehouseId
      );

      if (warehouseIndex === -1) {
        return {
          status: "error",
          message: "Warehouse not found with the specified warehouseId.",
        };
      }

      const geoLocationObject = await helpers.getLatLongFromZipCode(wOwner.businessAddress.zipCode);

      if (geoLocationObject.latitude === undefined || geoLocationObject.longitude === undefined) {
        return {
          status: "error",
          message:
            "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
        };
      }

      const existingWarehouse = currentUserWithWarehouses.warehouses[warehouseIndex];
      console.log(wOwner);

      // Update only non-empty fields in wOwner for the specific warehouse
      const updatedWarehouse = {
        _id: existingWarehouse.id,
        dateAdded: existingWarehouse.dateAdded,
        dateModified: dayjs().format(),
        name: wOwner?.name ? wOwner?.name.toString() : existingWarehouse.name,
        lobId: wOwner?.lobId ? wOwner?.lobId : existingWarehouse.lobId,
        //warehouseID is auto-generated, shouldn't be manually editable
        //warehouseId: wOwner?.warehouseId ? wOwner?.warehouseId : existingWarehouse.warehouseId,
        warehouseId: existingWarehouse.warehouseId,
        vendorId: wOwner?.vendorId ? wOwner?.vendorId : existingWarehouse.vendorId,
        phoneNumber: wOwner?.phoneNumber ? wOwner?.phoneNumber : existingWarehouse.phoneNumber,
        llcName: wOwner?.llcName ? wOwner?.llcName : existingWarehouse.llcName,
        businessName: wOwner?.businessName ? wOwner?.businessName : existingWarehouse.businessName,
        itemCategories: wOwner.itemCategories,
        itemSubCategories: wOwner.itemSubCategories,
        businessAddress: {
          address: wOwner?.businessAddress?.address
            ? wOwner?.businessAddress?.address
            : existingWarehouse.businessAddress.address,
          state: wOwner?.businessAddress?.state
            ? wOwner?.businessAddress?.state
            : existingWarehouse.businessAddress.state,
          city: wOwner?.businessAddress?.city ? wOwner?.businessAddress?.city : existingWarehouse.businessAddress.city,
          zipCode: wOwner?.businessAddress?.zipCode
            ? wOwner?.businessAddress?.zipCode
            : existingWarehouse.businessAddress.zipCode,
          lat: geoLocationObject.latitude.toString(),
          long: geoLocationObject.longitude.toString(),
        },
        businessPhoneNumber: wOwner?.businessPhoneNumber
          ? wOwner?.businessPhoneNumber
          : existingWarehouse.businessPhoneNumber,
        customerServiceEmailAddress: wOwner?.customerServiceEmailAddress
          ? wOwner?.customerServiceEmailAddress
          : existingWarehouse.customerServiceEmailAddress,
        costPerItemLabeling: wOwner?.costPerItemLabeling
          ? wOwner?.costPerItemLabeling
          : existingWarehouse.costPerItemLabeling,
        costPerBoxClosing: wOwner?.costPerBoxClosing ? wOwner?.costPerBoxClosing : existingWarehouse.costPerBoxClosing,
        costPerBox: wOwner?.costPerBox?.map((newCostPerBox, index) => {
          const existingCostPerBox = existingWarehouse.costPerBox[index];

          return {
            type: newCostPerBox?.type !== undefined ? newCostPerBox.type : existingCostPerBox.type,
            name: newCostPerBox?.name !== undefined ? newCostPerBox.name : existingCostPerBox.name,
            price: newCostPerBox?.price !== undefined ? newCostPerBox.price : existingCostPerBox.price,
            size: {
              width:
                newCostPerBox?.size?.width !== undefined ? newCostPerBox.size.width : existingCostPerBox.size.width,
              height:
                newCostPerBox?.size?.height !== undefined ? newCostPerBox.size.height : existingCostPerBox.size.height,
              length:
                newCostPerBox?.size?.length !== undefined ? newCostPerBox.size.length : existingCostPerBox.size.length,
            },
          };
        }),
        handleShrink: {
          answer: wOwner?.handleShrink?.answer ? wOwner?.handleShrink?.answer : existingWarehouse.handleShrink.answer,
          small: {
            price: wOwner?.handleShrink?.small.price
              ? wOwner?.handleShrink?.small.price
              : existingWarehouse.handleShrink.small.price,
          },
          medium: {
            price: wOwner?.handleShrink?.medium?.price
              ? wOwner?.handleShrink?.medium?.price
              : existingWarehouse.handleShrink.medium.price,
          },
          large: {
            price: wOwner?.handleShrink?.large?.price
              ? wOwner?.handleShrink?.large?.price
              : existingWarehouse.handleShrink.large.price,
          },
        },
        handleHazmat: {
          answer: wOwner?.handleHazmat?.answer ? wOwner?.handleHazmat?.answer : existingWarehouse.handleHazmat.answer,
          pricePerItem: wOwner?.handleHazmat?.pricePerItem
            ? wOwner?.handleHazmat?.pricePerItem
            : existingWarehouse.handleHazmat.pricePerItem,
        },
        bubbleWrapping: {
          answer: wOwner?.bubbleWrapping?.answer
            ? wOwner?.bubbleWrapping?.answer
            : existingWarehouse.bubbleWrapping.answer,
          pricePerItem: wOwner?.bubbleWrapping?.pricePerItem
            ? wOwner?.bubbleWrapping?.pricePerItem
            : existingWarehouse.bubbleWrapping.pricePerItem,
        },
        offerStorage: {
          answer: wOwner?.offerStorage?.answer ? wOwner?.offerStorage?.answer : existingWarehouse.offerStorage.answer,
          pricePerPalet: wOwner?.offerStorage?.pricePerPalet
            ? wOwner?.offerStorage?.pricePerPalet
            : existingWarehouse.offerStorage.pricePerPalet,
          pricePerCubicFeet: wOwner?.offerStorage?.pricePerCubicFeet
            ? wOwner?.offerStorage?.pricePerCubicFeet
            : existingWarehouse.offerStorage.pricePerCubicFeet,
        },
      };

      console.log(updatedWarehouse);

      // Update the specific warehouse in the array
      currentUserWithWarehouses.warehouses[warehouseIndex] = updatedWarehouse;

      // Create the update object
      updateObj = {
        email: wOwnerEmail,
        warehouses: currentUserWithWarehouses.warehouses,
      };

      return await WOwners.findOneAndUpdate({ email: wOwnerEmail }, updateObj);
    } catch (error) {
      return {
        status: "error",
        message: "There was an error updating your warehouse.",
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
        message: "The email and _id provided are not matching with a user with warehouse owners!",
      };
    }

    const updateWOwnersWithDeletedOne = helpers.removeObjectWithId(userWithWOwners.warehouses, _id);

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

const getSpecificWarehousesForThisUserById =
  (WOwners) =>
  async ({ email, _id }) => {
    const userWithWarehouses = await WOwners.findOne({ email: email.toLowerCase() });
    let warehouse;

    if (userWithWarehouses) {
      warehouse = userWithWarehouses.warehouses.find((w) => JSON.stringify(w._id) === JSON.stringify(_id));
    }

    if (warehouse) {
      return warehouse;
    } else {
      return {
        status: "error",
        message: `There is no wharehouse with id: ${_id} for warehouseOwner with email: ${email}`,
      }; // If userWithwarehouses not found or warehouse not found
    }
  };

module.exports = (WOwners) => {
  return {
    addWOwnerToDatabase: addWOwnerToDatabase(WOwners),
    getAllWOwnersFromDB: getAllWOwnersFromDB(WOwners),
    updateWarehousesInDBForExistingOwner: updateWarehousesInDBForExistingOwner(WOwners),
    deleteWOwnerFromSpecificUser: deleteWOwnerFromSpecificUser(WOwners),
    getWarehousesForThisUser: getWarehousesForThisUser(WOwners),
    editWarehousesInDBForExistingOwner: editWarehousesInDBForExistingOwner(WOwners),
    getSpecificWarehousesForThisUserById: getSpecificWarehousesForThisUserById(WOwners),
  };
};
