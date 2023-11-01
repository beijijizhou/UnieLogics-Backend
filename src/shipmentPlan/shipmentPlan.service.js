const { randomUUID } = require("crypto");
const helpers = require("../_helpers/utils");

const addShipmentPlanToDB =
  (ShipmentPlan) =>
  async ({ email, shipmentTitle, products }) => {
    const newShipmentPlan = new ShipmentPlan({
      email,
      shipmentTitle,
      shipmentPlans: [
        {
          _id: randomUUID(),
          products,
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
    };
    currentUserWithShipmentPlans.shipmentTitle = shipmentTitle;
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
    console.log(email, _id);
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

    console.log("updateShipmentPlansWithDeletedOne");
    console.log(updateShipmentPlansWithDeletedOne);

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

module.exports = (ShipmentPlan) => {
  return {
    addShipmentPlanToDB: addShipmentPlanToDB(ShipmentPlan),
    getAllShipmentPlansFromDB: getAllShipmentPlansFromDB(ShipmentPlan),
    updateShipmentPlansForExistingEmailInDB:
      updateShipmentPlansForExistingEmailInDB(ShipmentPlan),
    deleteShipmentPlanFromSpecificUser:
      deleteShipmentPlanFromSpecificUser(ShipmentPlan),
  };
};
