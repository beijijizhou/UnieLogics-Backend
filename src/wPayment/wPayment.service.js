const ShipmentPlanService = require("../shipmentPlan");

const confirmPaymentInDb =
  (WPayment) =>
  async ({ sessionId, email }) => {
    try {
      const currentUserWithShipmentPlans =
        await ShipmentPlanService.getAllShipmentPlansFromDB({ email });

      let shipmentPlanIdToUpdate = "";
      let shipmentPlanExistsForThisUser = false;

      currentUserWithShipmentPlans?.shipmentPlans?.forEach((shipmentPlan) => {
        if (
          JSON.stringify(shipmentPlan.payment.id) === JSON.stringify(sessionId)
        ) {
          shipmentPlanIdToUpdate = shipmentPlan._id;
          shipmentPlanExistsForThisUser = true;
        }
      });

      if (!shipmentPlanExistsForThisUser) {
        return {
          status: "error",
          message: `There is no shipment plan initiating payment with id: ${sessionId} for user ${email}`,
          response: null,
        };
      }

      return await ShipmentPlanService.updateShipmentPlanBasedOnId({
        email,
        shipmentPlanId: shipmentPlanIdToUpdate,
        paymentStatus: true,
      });
    } catch (error) {
      console.log(error);
      return {
        status: "error",
        message:
          "There was an error confirming your payment. Please contact us with the session id used to pay from the URL.",
      };
    }
  };
module.exports = (WPayment) => {
  return {
    confirmPaymentInDb: confirmPaymentInDb(WPayment),
  };
};
