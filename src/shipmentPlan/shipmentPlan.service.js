const { randomUUID } = require("crypto");

const addShipmentPlanToDB =
  (ShipmentPlan) =>
  async ({ email, products }) => {
    new ShipmentPlan({
      email,
      shipmentPlans: [
        {
          _id: randomUUID(),
          products,
        },
      ],
    }).save();
  };

const updateShipmentPlansForExistingEmailInDB =
  (ShipmentPlan) =>
  async ({ email, products }) => {
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
    const updateObj = {
      email,
      shipmentPlans: [
        ...currentUserWithShipmentPlans.shipmentPlans,
        {
          _id: randomUUID(),
          products,
        },
      ],
    };

    return await ShipmentPlan.findOneAndUpdate({ email }, updateObj);
  };

const getAllShipmentPlansFromDB =
  (ShipmentPlan) =>
  async ({ email }) => {
    return await ShipmentPlan.findOne({ email });
  };

module.exports = (ShipmentPlan) => {
  return {
    addShipmentPlanToDB: addShipmentPlanToDB(ShipmentPlan),
    getAllShipmentPlansFromDB: getAllShipmentPlansFromDB(ShipmentPlan),
    updateShipmentPlansForExistingEmailInDB:
      updateShipmentPlansForExistingEmailInDB(ShipmentPlan),
  };
};
