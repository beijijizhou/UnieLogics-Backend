const ShipmentPlanService = require(".");

const add = async (req, res) => {
  const { email, shipmentTitle, products } = req.body;
  const missingFields = [];

  if (!email) missingFields.push("email");
  if (!shipmentTitle) missingFields.push("shipmentTitle");
  if (!products || !Array.isArray(products) || products.length === 0) {
    missingFields.push("products");
  } else {
    products.forEach((product, index) => {
      if (!product.asin) missingFields.push(`products[${index}].asin`);
      if (!product.title) missingFields.push(`products[${index}].title`);
      if (!product.inventory)
        missingFields.push(`products[${index}].inventory`);
      if (!product.dateAdded)
        missingFields.push(`products[${index}].dateAdded`);
      if (!product.wxhxl) missingFields.push(`products[${index}].wxhxl`);
      if (!product.amazonPrice)
        missingFields.push(`products[${index}].amazonPrice`);
      if (!product.supplier) missingFields.push(`products[${index}].supplier`);
      if (!product.imageUrl) missingFields.push(`products[${index}].imageUrl`);
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
        await ShipmentPlanService.addShipmentPlanToDB({
          email,
          shipmentTitle,
          products,
        });

      if (addShipmentPlanToDBResponse?.status === "error") {
        return res.status(400).json({
          ...addShipmentPlanToDBResponse,
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Successfully added Shipment Plan to the database.`,
        response: {
          planId: addShipmentPlanToDBResponse.shipmentPlans[0]._id,
        },
      });
    } else {
      const updateShipmentPlanResponse =
        await ShipmentPlanService.updateShipmentPlansForExistingEmailInDB({
          email,
          shipmentTitle,
          products,
        });

      console.log(updateShipmentPlanResponse);

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

const deleteShipmentPlan = async (req, res) => {
  const { email, _id } = req.body;

  if (!_id || !email) {
    console.log(
      "No ID or EMAIL has been provided, so we don't know which shipment plan to delete!"
    );

    return res.status(400).json({
      status: "errror",
      message:
        "No ID or EMAIL has been provided, so we don't know which shipment plan to delete!",
    });
  }

  try {
    const deleteShipmentPlanResponse =
      await ShipmentPlanService.deleteShipmentPlanFromSpecificUser({
        email: email.toLowerCase(),
        _id,
      });

    if (deleteShipmentPlanResponse?.status === "error") {
      console.log(deleteShipmentPlanResponse);
      return res.status(400).json({
        ...deleteShipmentPlanResponse,
      });
    } else {
      console.log(deleteShipmentPlanResponse);

      return res.status(200).json({
        status: "success",
        message: `Successfully deleted supplier with id ${_id}`,
        response: deleteShipmentPlanResponse,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const getById = async (req, res) => {
  const { email, _id } = req.query;

  const missingFields = [];

  if (!email) missingFields.push("email");
  if (!_id) missingFields.push("_id");

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  try {
    const retrieveShipmentPlanById =
      await ShipmentPlanService.getShipmentPlanByIdFromDb({ email, _id });

    if (retrieveShipmentPlanById?.length === 0 || !retrieveShipmentPlanById) {
      return res.status(403).json({
        status: "error",
        message: `Sorry, there are no Shipment Plans with id: ${_id}`,
        response: retrieveShipmentPlanById || [],
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved Shipment Plan with id ${_id}`,
      response: retrieveShipmentPlanById,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};
module.exports = {
  add,
  getAll,
  getById,
  deleteShipmentPlan,
};
