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
    let updateObj = {};
    const currentUserWithShipmentPlans = await ShipmentPlan.findOne({
      email,
    });

    updateObj = {
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
