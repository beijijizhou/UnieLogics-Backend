const WOwnersService = require(".");
const UserService = require("../users");
const emailTemplates = require("../_helpers/emailTemplates");
const mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});
const from_who = "donotreply@unielogics.com";
const helpers = require("../_helpers/utils");

const add = async (req, res) => {
  const { loggedInEmail, wOwner } = req.body;

  if (loggedInEmail !== "franco@peri-mail.com") {
    return res.status(403).json({
      status: "error",
      message:
        "You cannot access this section with this email address. Only the admin can access it!",
    });
  }

  const missingFields = [];

  if (!wOwner) missingFields.push("wOwner");
  if (!wOwner?.lobId) missingFields.push("lobId");
  if (!wOwner?.vendorId) missingFields.push("vendorId");
  if (!wOwner?.businessName) missingFields.push("businessName");
  if (!wOwner?.businessAddress) {
    missingFields.push("businessAddress");
  } else {
    if (!wOwner.businessAddress.zipCode) missingFields.push("businessAddress.zipCode");
    if (!wOwner.businessAddress.state) missingFields.push("businessAddress.state");
    if (!wOwner.businessAddress.city) missingFields.push("businessAddress.city");
  }
  if (!wOwner?.phoneNumber) missingFields.push("phoneNumber");
  if (!wOwner?.customerServiceEmailAddress)
    missingFields.push("customerServiceEmailAddress");

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  try {
    const createUserResponse = await UserService.registerUser({
      firstName: wOwner.name || "Warehouse",
      lastName: wOwner.businessName,
      email: wOwner.email?.toLowerCase(),
      username: wOwner.email?.toLowerCase(),
      password: wOwner.password || "defaultPassword123!",
      billingID: "warehouse-owner-billing-id-not-needed",
      plan: "none",
      endDate: null,
      role: "warehouseOwner",
      phoneNumber: wOwner.phoneNumber,
    });

    const addWOwnerResponse = await WOwnersService.addWOwnerToDatabase({ wOwner });

    if (addWOwnerResponse?.status === "error") {
      return res.status(400).json({
        ...addWOwnerResponse,
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully added Warehouse Owner to the database!`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const edit = async (req, res) => {
  const { loggedInEmail, wOwner, warehouseId, wOwnerEmail } = req.body;

  if (loggedInEmail !== "franco@peri-mail.com") {
    return res.status(403).json({
      status: "error",
      message:
        "You cannot access this section with this email address. Only the admin can access it!",
    });
  }

  const missingFields = [];

  if (!loggedInEmail) missingFields.push("loggedInEmail");
  if (!warehouseId) missingFields.push("warehouseId");
  if (!wOwner) missingFields.push("wOwner");
  if (!wOwnerEmail) missingFields.push("wOwnerEmail");
  if (wOwner?.businessAddress) {
    if (!wOwner?.businessAddress.zipCode) missingFields.push("businessAddress.zipCode");
    if (!wOwner?.businessAddress.state) missingFields.push("businessAddress.state");
    if (!wOwner?.businessAddress.city) missingFields.push("businessAddress.city");
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  try {
    const updateWarehousesForExistingOwnerResponse =
      await WOwnersService.editWarehousesInDBForExistingOwner({
        wOwner,
        warehouseId,
        wOwnerEmail,
      });

    if (updateWarehousesForExistingOwnerResponse?.status === "error") {
      return res.status(400).json({
        ...updateWarehousesForExistingOwnerResponse,
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully updated Warehouses for existing Warehouse Owner!`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  getAll,
  add,
  deleteWOwner,
  edit,
};
