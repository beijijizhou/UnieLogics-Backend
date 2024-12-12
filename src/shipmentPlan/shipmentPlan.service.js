const { randomUUID } = require("crypto");
const helpers = require("../_helpers/utils");
const dayjs = require("dayjs");
const fs = require("fs").promises;
const path = require("path");
const shipmentPlanModel = require('./shipmentPlan.model');

const addShipmentPlanToDB =
  (ShipmentPlan) =>
  async ({ email, shipmentTitle, products, orderNo, receiptNo, orderDate }) => {
    const generateNineDigitNumber = () => Math.floor(100000000 + Math.random() * 900000000);

    const newShipmentPlan = new ShipmentPlan({
      email,
      vendorNo: generateNineDigitNumber(),
      customerNo: `UC-${generateNineDigitNumber()}`,
      shipmentPlans: [
        {
          _id: randomUUID(),
          products,
          shipmentTitle,
          dateAdded: dayjs().format(),
          orderNo,
          receiptNo,
          orderDate
        },
      ],
    });

    await newShipmentPlan.save();

    return await ShipmentPlan.findOne({ email });
  };

const updateShipmentPlansForExistingEmailInDB =
  (ShipmentPlan) =>
  async ({ email, shipmentTitle, products, orderNo, receiptNo, orderDate }) => {
    const currentUserWithShipmentPlans = await ShipmentPlan.findOne({ email });

    // Check if all product.asin values are already present in any existing shipment plan
    const existingPlan = currentUserWithShipmentPlans.shipmentPlans.find(
      (plan) => {
        const existingAsins = plan.products.map((product) => product.asin);
        return (
          products.length === existingAsins.length &&
          products.every((product) => existingAsins.includes(product.asin))
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
      orderNo,
      receiptNo,
      orderDate,
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
  async ({
    email,
    shipmentPlanId,
    shipmentTitle,
    products,
    orderNo,
    receiptNo,
    orderDate,
    warehouseOwner,
    amazonData,
    paymentId,
    paymentStatus,
    status,
    infoPlusVendorId,
    infoPlusCustomerId,
    infoPlusAsnId,
    infoPlusOrderId,
    cronResponse,
  }) => {
    const currentUserWithShipmentPlans = await ShipmentPlan.findOne({ email });

    let shipmentPlanExistsForThisUser = false;
    const updatedShipmentPlansWithProductsForSpecificShipmentPlan =
      currentUserWithShipmentPlans?.shipmentPlans?.map((shipmentPlan) => {
        if (
          JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
        ) {
          shipmentPlanExistsForThisUser = true;

          if (shipmentTitle) shipmentPlan.shipmentTitle = shipmentTitle;
          if (products) shipmentPlan.products = products;
          if (orderNo) shipmentPlan.orderNo = orderNo;
          if (receiptNo) shipmentPlan.receiptNo = receiptNo;
          if (orderDate) shipmentPlan.orderDate = orderDate;
          // Handle warehouseOwner dynamically
        if (warehouseOwner && typeof warehouseOwner === 'object' && Object.keys(warehouseOwner).length !== 0) {
          shipmentPlan.warehouseOwner = shipmentPlan.warehouseOwner || {};
          Object.keys(warehouseOwner).forEach((key) => {
            if (warehouseOwner[key] !== undefined && warehouseOwner[key] !== null) {
              shipmentPlan.warehouseOwner[key] = warehouseOwner[key];
            }
          });
        }

        // Handle amazonData dynamically
        if (amazonData && typeof amazonData === 'object' && Object.keys(amazonData).length !== 0) {
          shipmentPlan.amazonData = shipmentPlan.amazonData || {};
          Object.keys(amazonData).forEach((key) => {
            if (amazonData[key] !== undefined && amazonData[key] !== null) {
              shipmentPlan.amazonData[key] = amazonData[key];
            }
          });
        }
          
          shipmentPlan.dateUpdated = dayjs().format();
          if (paymentId) shipmentPlan.payment.id = paymentId;
          if (paymentStatus) shipmentPlan.payment.paid = paymentStatus;
          if (status) shipmentPlan.status = status;
          if (infoPlusVendorId) shipmentPlan.infoPlusVendorId = infoPlusVendorId;
          if (infoPlusCustomerId) shipmentPlan.infoPlusCustomerId = infoPlusCustomerId;
          if (infoPlusAsnId) shipmentPlan.infoPlusAsnId = infoPlusAsnId;
          if (infoPlusOrderId) shipmentPlan.infoPlusOrderId = infoPlusOrderId;
          if (cronResponse) shipmentPlan.cronResponse = cronResponse;
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
  async ({ email, shipmentPlanId, fileType, files }) => {
    const currentUserWithShipmentPlans = await ShipmentPlan.findOne({ email });

    let shipmentPlanExistsForThisUser = false;

    if (
      !currentUserWithShipmentPlans ||
      !currentUserWithShipmentPlans?.shipmentPlans
    ) {
      return {
        status: "error",
        message: `There is no shipment plan matching with id: ${shipmentPlanId} for user ${email}`,
        response: [],
      };
    }

    const updatedShipmentPlansWithProductsForSpecificShipmentPlan =
      currentUserWithShipmentPlans.shipmentPlans.map(async (shipmentPlan) => {
        if (
          JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
        ) {
          shipmentPlanExistsForThisUser = true;

          // Filter files in are equal with files sent from files
          const filesToDelete = shipmentPlan.files[fileType].filter((dbFile) =>
            files.some(
              (file) =>
                file.filename.split("_")[1] === dbFile.filename.split("_")[1]
            )
          );
          console.log("FILES TO DELETE");
          console.log(filesToDelete);

          // Delete files that already exist
          for (const fileToDelete of filesToDelete) {
            const filePathToDelete = path.join(
              __dirname,
              "../..",
              "uploads",
              fileToDelete.filename
            );
            try {
              await fs.unlink(filePathToDelete);
              console.log(`Deleted file: ${filePathToDelete}`);
            } catch (err) {
              if (err.code === "ENOENT") {
                console.log(`File not found: ${filePathToDelete}`);
              } else {
                console.error(`Error deleting file: ${filePathToDelete}`, err);
              }
            }
          }

          // Update the existing object in the array with the new filenames
          shipmentPlan.files[fileType] = shipmentPlan.files[fileType].map(
            (dbFile) => {
              const matchingFile = files.find(
                (file) =>
                  file.filename.split("_")[1] === dbFile.filename.split("_")[1]
              );
              return matchingFile
                ? { filename: matchingFile.filename }
                : dbFile;
            }
          );

          // Append new files to the existing array
          shipmentPlan.files[fileType] = [
            ...shipmentPlan.files[fileType],
            ...files
              .filter(
                (file) =>
                  !shipmentPlan.files[fileType].some(
                    (dbFile) =>
                      file.filename.split("_")[1] ===
                      dbFile.filename.split("_")[1]
                  )
              )
              .map((file) => ({
                filename: file.filename,
              })),
          ];
        }
        return shipmentPlan;
      });

    if (!shipmentPlanExistsForThisUser) {
      return {
        status: "error",
        message: `There is no shipment plan matching with id: ${shipmentPlanId} for user ${email}`,
        response: [],
      };
    }

    const updateObj = {
      ...currentUserWithShipmentPlans,
      shipmentPlans: await Promise.all(
        updatedShipmentPlansWithProductsForSpecificShipmentPlan
      ),
    };

    await ShipmentPlan.findOneAndUpdate({ email }, updateObj);

    const userWithShipmentPlans = await ShipmentPlan.findOne({ email });

    return userWithShipmentPlans?.shipmentPlans?.filter((shipmentPlan) => {
      return (
        JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
      );
    });
  };

const deleteFileFromShipmentPlan =
  (ShipmentPlan) =>
  async ({ email, shipmentPlanId, fileToDelete, fileType }) => {
    try {
      const currentUserWithShipmentPlans = await ShipmentPlan.findOne({
        email,
      });

      if (
        !currentUserWithShipmentPlans ||
        !currentUserWithShipmentPlans.shipmentPlans
      ) {
        return {
          status: "error",
          message: `There is no shipment plan matching with id: ${shipmentPlanId} for user ${email}`,
          response: [],
        };
      }

      let noFileFound = false;
      let shipmentPlanWithIdNotFound = false;
      const updatedShipmentPlans = await Promise.all(
        currentUserWithShipmentPlans.shipmentPlans.map(async (shipmentPlan) => {
          if (
            JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
          ) {
            shipmentPlanWithIdNotFound = true;
            const filesInType = shipmentPlan.files[fileType];

            // Find the file to delete
            const fileIndex = filesInType.findIndex(
              (file) => file._id.toString() === fileToDelete.toString()
            );

            if (fileIndex !== -1) {
              // Delete the file from the disk
              const filenameToDelete = filesInType[fileIndex].filename;
              const filePathToDelete = path.join(
                __dirname,
                "../..",
                "uploads",
                filenameToDelete
              );

              filesInType.splice(fileIndex, 1);
              shipmentPlan.files[fileType] = filesInType;
              try {
                await fs.unlink(filePathToDelete);
                console.log(`Deleted file: ${filePathToDelete}`);
              } catch (err) {
                if (err.code === "ENOENT") {
                  console.log(`File not found: ${filePathToDelete}`);
                } else {
                  console.error(
                    `Error deleting file: ${filePathToDelete}`,
                    err
                  );
                }
              }
            } else {
              noFileFound = true;
            }
          }
          return shipmentPlan;
        })
      );

      // Update the database with the modified shipment plans
      await ShipmentPlan.findOneAndUpdate(
        { email },
        { shipmentPlans: updatedShipmentPlans }
      );

      const userWithShipmentPlans = await ShipmentPlan.findOne({ email });

      if (!shipmentPlanWithIdNotFound) {
        return {
          status: "error",
          message:
            "We were not able to find any shipment plan with provided id",
        };
      }

      if (noFileFound) {
        return {
          status: "error",
          message: "We couldn't find this file.",
        };
      }

      return userWithShipmentPlans?.shipmentPlans?.filter((shipmentPlan) => {
        return (
          JSON.stringify(shipmentPlan._id) === JSON.stringify(shipmentPlanId)
        );
      });
    } catch (error) {
      console.error("An error occurred:", error);
      return {
        status: "error",
        message: "An error occurred during file deletion.",
        response: [],
      };
    }
};

module.exports = deleteFileFromShipmentPlan;

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
    deleteFileFromShipmentPlan: deleteFileFromShipmentPlan(ShipmentPlan),
  };
};
