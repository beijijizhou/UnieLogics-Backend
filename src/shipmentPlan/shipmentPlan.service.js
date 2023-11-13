const { randomUUID } = require("crypto");
const helpers = require("../_helpers/utils");
const dayjs = require("dayjs");
const FileType = require("./fileTypesEnum");
const fs = require("fs").promises;
const path = require("path");

const addShipmentPlanToDB =
  (ShipmentPlan) =>
  async ({ email, shipmentTitle, products }) => {
    const newShipmentPlan = new ShipmentPlan({
      email,
      shipmentPlans: [
        {
          _id: randomUUID(),
          products,
          shipmentTitle,
          dateAdded: dayjs().format(),
        },
      ],
    });

    await newShipmentPlan.save();

    return await ShipmentPlan.findOne({ email });
  };

const updateShipmentPlansForExistingEmailInDB =
  (ShipmentPlan) =>
  async ({ email, shipmentTitle, products }) => {
    const currentUserWithShipmentPlans = await ShipmentPlan.findOne({ email });

    // Check if all product.asin values are already present in any existing shipment plan
    const existingPlan = currentUserWithShipmentPlans.shipmentPlans.find(
      (plan) => {
        const existingAsins = plan.products.map((product) => product.asin);
        return products.every((product) =>
          existingAsins.includes(product.asin)
        );
      }
    );

    if (existingPlan) {
      return {
        status: "error",
        message: "Shipment plan with all ASINs already exists",
        response: {
          planId: existingPlan._id,
        },
      };
    }

    // If no duplicates are found, update the shipment plan
    const newShipmentPlan = {
      _id: randomUUID(),
      products,
      shipmentTitle,
      dateAdded: dayjs().format(),
    };
    currentUserWithShipmentPlans.shipmentPlans.push(newShipmentPlan);

    // Save the updated document and return the updated shipment plan
    await currentUserWithShipmentPlans.save();
    return newShipmentPlan;
  };

const getAllShipmentPlansFromDB =
  (ShipmentPlan) =>
  async ({ email }) => {
    return await ShipmentPlan.findOne({ email });
  };

const deleteShipmentPlanFromSpecificUser =
  (ShipmentPlan) =>
  async ({ email, _id }) => {
    const userWithShipmentPlans = await ShipmentPlan.findOne({ email });

    if (!userWithShipmentPlans) {
      return {
        status: "error",
        message:
          "The email and _id provided are not matching with a user with shipment plans!",
      };
    }

    const updateShipmentPlansWithDeletedOne = helpers.removeObjectWithId(
      userWithShipmentPlans.shipmentPlans,
      _id
    );

    if (updateShipmentPlansWithDeletedOne === "no_object_with_id") {
      return {
        status: "error",
        message: "There is no shipment plan with this id for this user.",
      };
    }
    const updateObj = {
      ...userWithShipmentPlans,
      shipmentPlans: {
        ...updateShipmentPlansWithDeletedOne,
      },
    };

    await ShipmentPlan.findOneAndUpdate({ email }, updateObj);

    return await ShipmentPlan.findOne({ email });
  };

const getShipmentPlanByIdFromDb =
  (ShipmentPlan) =>
  async ({ email, _id }) => {
    const userWithShipmentPlans = await ShipmentPlan.findOne({ email });

    return (shipmentPlan = userWithShipmentPlans?.shipmentPlans?.filter(
      (shipmentPlan) => {
        return JSON.stringify(shipmentPlan._id) === JSON.stringify(_id);
      }
    ));
  };

const updateShipmentPlanBasedOnId =
  (ShipmentPlan) =>
  async ({ email, shipmentPlanId, shipmentTitle, products }) => {
    const currentUserWithShipmentPlans = await ShipmentPlan.findOne({ email });

    let shipmentPlanExistsForThisUser = false;
    const updatedShipmentPlansWithProductsForSpecificShipmentPlan =
      currentUserWithShipmentPlans.shipmentPlans.map((shipmentPlan) => {
        if (
          JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
        ) {
          shipmentPlanExistsForThisUser = true;
          shipmentPlan.products = products;
          shipmentPlan.dateUpdated = dayjs().format();
          shipmentPlan.shipmentTitle = shipmentTitle;
        }
        return shipmentPlan;
      });

    if (!shipmentPlanExistsForThisUser) {
      return {
        status: "error",
        message: `There is no shipment plan matchind with id: ${shipmentPlanId} for user ${email}`,
        response: [],
      };
    }
    const updateObj = {
      ...currentUserWithShipmentPlans,
      shipmentPlans: {
        ...updatedShipmentPlansWithProductsForSpecificShipmentPlan,
      },
    };

    await ShipmentPlan.findOneAndUpdate({ email }, updateObj);

    const userWithShipmentPlans = await ShipmentPlan.findOne({ email });

    return userWithShipmentPlans?.shipmentPlans?.filter((shipmentPlan) => {
      return (
        JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
      );
    });
  };

const deleteProductFromShipmentPlanFromSpecificUser =
  (ShipmentPlan) =>
  async ({ email, shipmentPlanId, productId }) => {
    const userWithShipmentPlans = await ShipmentPlan.findOne({ email });

    if (!userWithShipmentPlans) {
      return {
        status: "error",
        message:
          "The email and shipmentPlanId provided are not matching with a user with shipment plans!",
      };
    }

    let noProductWithId = false;
    let deleteShipmentPlan = false;
    let shipmentPlanFound = false;

    const updatedShipmentPlansWithProductsForSpecificShipmentPlan =
      userWithShipmentPlans.shipmentPlans.map((shipmentPlan) => {
        if (
          JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
        ) {
          shipmentPlanFound = true;
          const updateShipmentPlansWithDeletedOne = helpers.removeObjectWithId(
            shipmentPlan.products,
            productId
          );
          if (
            Array.isArray(updateShipmentPlansWithDeletedOne) &&
            updateShipmentPlansWithDeletedOne.length === 0
          ) {
            // Set the flag to indicate that the shipment plan should be deleted
            deleteShipmentPlan = true;
          } else if (
            updateShipmentPlansWithDeletedOne === "no_object_with_id"
          ) {
            noProductWithId = true;
          } else {
            shipmentPlan.products = updateShipmentPlansWithDeletedOne;
          }
        }
        return shipmentPlan;
      });

    if (!shipmentPlanFound) {
      return {
        status: "error",
        message:
          "There is no Shipment Plan mathing the id and user combination.",
      };
    }

    if (noProductWithId) {
      return {
        status: "error",
        message:
          "There is no product with this id in the provided shipment plan.",
      };
    }

    if (deleteShipmentPlan) {
      // Filter out the shipment plan to be deleted
      userWithShipmentPlans.shipmentPlans = helpers.removeObjectWithId(
        userWithShipmentPlans.shipmentPlans,
        shipmentPlanId
      );
    }

    const updateObj = {
      ...userWithShipmentPlans,
    };

    if (!deleteShipmentPlan) {
      // Update shipment plans with the modified products
      updateObj.shipmentPlans =
        updatedShipmentPlansWithProductsForSpecificShipmentPlan;
    }

    await ShipmentPlan.findOneAndUpdate({ email }, updateObj);

    if (deleteShipmentPlan) {
      return {
        status: "conflict",
      };
    }

    const userWithShipmentPlansAfterDelete = await ShipmentPlan.findOne({
      email,
    });

    return userWithShipmentPlansAfterDelete?.shipmentPlans?.filter(
      (shipmentPlan) => {
        return (
          JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
        );
      }
    );
  };

const uploadFilesToDB =
  (ShipmentPlan) =>
  async ({ email, shipmentPlanId, fileType, filename }) => {
    const currentUserWithShipmentPlans = await ShipmentPlan.findOne({ email });

    let shipmentPlanExistsForThisUser = false;
    console.log(currentUserWithShipmentPlans);
    if (
      !currentUserWithShipmentPlans ||
      !currentUserWithShipmentPlans?.shipmentPlans
    ) {
      return {
        status: "error",
        message: `There is no shipment plan matchind with id: ${shipmentPlanId} for user ${email}`,
        response: [],
      };
    }
    const updatedShipmentPlansWithProductsForSpecificShipmentPlan =
      currentUserWithShipmentPlans.shipmentPlans.map(async (shipmentPlan) => {
        if (
          JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
        ) {
          shipmentPlanExistsForThisUser = true;

          // Delete existing file from the disk
          const existingFilename =
            fileType === FileType.FBALabels
              ? shipmentPlan.files.fbaLabels.filename
              : shipmentPlan.files.skuLabels.filename;

          // Update the filename in the shipment plan
          if (fileType === FileType.FBALabels) {
            shipmentPlan.files.fbaLabels.filename = filename;
          } else if (fileType === FileType.SKULabels) {
            shipmentPlan.files.skuLabels.filename = filename;
          }

          if (existingFilename) {
            const filePath = path.join(
              __dirname,
              "../..",
              "uploads",
              existingFilename
            );

            try {
              await fs.unlink(filePath);
              console.log(`Deleted file: ${filePath}`);
            } catch (err) {
              if (err.code === "ENOENT") {
                console.log(`File not found: ${filePath}`);
              } else {
                console.error(`Error deleting file: ${filePath}`, err);
              }
            }
          } else {
            console.log("No existing filename to delete.");
          }
        }
        return shipmentPlan;
      });

    if (!shipmentPlanExistsForThisUser) {
      return {
        status: "error",
        message: `There is no shipment plan matchind with id: ${shipmentPlanId} for user ${email}`,
        response: [],
      };
    }
    const updateObj = {
      ...currentUserWithShipmentPlans,
      shipmentPlans: {
        ...updatedShipmentPlansWithProductsForSpecificShipmentPlan,
      },
    };

    await ShipmentPlan.findOneAndUpdate({ email }, updateObj);

    const userWithShipmentPlans = await ShipmentPlan.findOne({ email });

    return userWithShipmentPlans?.shipmentPlans?.filter((shipmentPlan) => {
      return (
        JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
      );
    });
  };

module.exports = (ShipmentPlan) => {
  return {
    addShipmentPlanToDB: addShipmentPlanToDB(ShipmentPlan),
    getAllShipmentPlansFromDB: getAllShipmentPlansFromDB(ShipmentPlan),
    updateShipmentPlansForExistingEmailInDB:
      updateShipmentPlansForExistingEmailInDB(ShipmentPlan),
    deleteShipmentPlanFromSpecificUser:
      deleteShipmentPlanFromSpecificUser(ShipmentPlan),
    getShipmentPlanByIdFromDb: getShipmentPlanByIdFromDb(ShipmentPlan),
    updateShipmentPlanBasedOnId: updateShipmentPlanBasedOnId(ShipmentPlan),
    deleteProductFromShipmentPlanFromSpecificUser:
      deleteProductFromShipmentPlanFromSpecificUser(ShipmentPlan),
    uploadFilesToDB: uploadFilesToDB(ShipmentPlan),
  };
};
