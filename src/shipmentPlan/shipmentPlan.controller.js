const ShipmentPlanService = require(".");

const add = async (req, res) => {
  const { email, products } = req.body;
  const missingFields = [];

  if (!email) missingFields.push("email");
  if (!products || !Array.isArray(products) || products.length === 0) {
    missingFields.push("products");
  } else {
    products.forEach((plan, index) => {
      if (!plan.asin) missingFields.push(`products[${index}].asin`);
      if (!plan.title) missingFields.push(`products[${index}].title`);
      if (!plan.inventory) missingFields.push(`products[${index}].inventory`);
      if (!plan.dateAdded) missingFields.push(`products[${index}].dateAdded`);
      if (!plan.wxhxl) missingFields.push(`products[${index}].wxhxl`);
      if (!plan.amazonPrice)
        missingFields.push(`products[${index}].amazonPrice`);
      if (!plan.supplier) missingFields.push(`products[${index}].supplier`);
    });
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  try {
    const existingShipmentPlansResponse =
      await ShipmentPlanService.getAllShipmentPlansFromDB({ email });

    if (!existingShipmentPlansResponse) {
      const addShipmentPlanToDBResponse =
        await ShipmentPlanService.addShipmentPlanToDB({ email, products });

      if (addShipmentPlanToDBResponse?.status === "error") {
        return res.status(400).json({
          ...addShipmentPlanToDBResponse,
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Successfully added Shipment Plan to the database.`,
        response: {
          planId: existingShipmentPlansResponse._id,
        },
      });
    } else {
      const updateShipmentPlanResponse =
        await ShipmentPlanService.updateShipmentPlansForExistingEmailInDB({
          email,
          products,
        });

      if (updateShipmentPlanResponse?.status === "error") {
        return res.status(400).json({
          ...updateShipmentPlanResponse,
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Successfully updated Shipment Plan for existing email.`,
        response: {
          planId: updateShipmentPlanResponse._id,
        },
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const getAll = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(403).json({
      status: "error",
      message: "Sorry, there was an error retriving your shipment plans!",
    });
  }
  try {
    const existingShipmentPlansResponse =
      await ShipmentPlanService.getAllShipmentPlansFromDB({ email });

    res.status(200).json({
      status: "success",
      message: "Successfully retrieved your Shipment Plans",
      response: !existingShipmentPlansResponse
        ? []
        : existingShipmentPlansResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: "error",
      message: "There was an error processing your request.",
    });
  }
};
module.exports = {
  add,
  getAll,
};
