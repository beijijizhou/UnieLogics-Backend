const WOwnersService = require(".");
const UserService = require("../users");
const emailTemplates = require("../_helpers/emailTemplates");
const mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});
const from_who = "donotreply@asinmice.com";
const helpers = require("../_helpers/utils");

const add = async (req, res) => {
  const { loggedInEmail, wOwner } = req.body;

  if (loggedInEmail !== "franco@peri-mail.com") {
    res.status(403).json({
      status: "error",
      message:
        "You cannot access this section with this email address. Only the admin can access it!",
    });
  }
  const missingFields = [];

  const isAnswerNo = (obj) => {
    return obj?.answer === "no";
  };
  if (!wOwner) missingFields.push("wOwner");
  if (!wOwner?.name) missingFields.push("name");
  if (!wOwner?.lobId) missingFields.push("lobId");
  if (!wOwner?.warehouseId) missingFields.push("warehouseId");
  if (!wOwner?.vendorId) missingFields.push("vendorId");
  if (!wOwner?.password) missingFields.push("password");
  if (!wOwner?.email) missingFields.push("email");
  if (!wOwner?.phoneNumber) missingFields.push("phoneNumber");
  if (!wOwner?.llcName) missingFields.push("llcName");
  if (!wOwner?.businessName) missingFields.push("businessName");
  if (!wOwner?.businessAddress) missingFields.push("businessAddress");
  if (wOwner?.businessAddress) {
    if (!wOwner?.businessAddress.zipCode) {
      missingFields.push("businessAddress.zipCode");
    } else {
      // Add a rule to check if the ZIP code is from the U.S.
      if (!helpers.isUSZipCode(wOwner.businessAddress.zipCode)) {
        return res.status(400).json({
          status: "error",
          message: "ZIP code needs to be from the U.S.",
        });
      }
    }
  }
  if (!wOwner?.businessPhoneNumber) missingFields.push("businessPhoneNumber");
  if (!wOwner?.customerServiceEmailAddress)
    missingFields.push("customerServiceEmailAddress");
  if (!wOwner?.costPerItemLabeling) missingFields.push("costPerItemLabeling");
  if (!wOwner?.costPerBoxClosing) missingFields.push("costPerBoxClosing");
  if (!wOwner?.costPerBox?.length) missingFields.push("costPerBox");

  if (!wOwner?.handleHazmat) missingFields.push("handleHazmat");
  else {
    if (!isAnswerNo(wOwner?.handleHazmat)) {
      if (!wOwner.handleHazmat?.pricePerItem) {
        missingFields.push("handleHazmat.pricePerItem");
      }
    } else {
      if (!wOwner?.handleHazmat?.answer) {
        missingFields.push("handleHazmat.answer");
      }
    }
  }

  if (!wOwner?.bubbleWrapping) missingFields.push("bubbleWrapping");
  else {
    if (!isAnswerNo(wOwner?.bubbleWrapping)) {
      if (!wOwner?.bubbleWrapping?.pricePerItem) {
        missingFields.push("bubbleWrapping.pricePerItem");
      }
    } else {
      if (!wOwner?.bubbleWrapping?.answer) {
        missingFields.push("bubbleWrapping.answer");
      }
    }
  }

  if (!wOwner?.offerStorage) missingFields.push("offerStorage");
  else {
    if (!isAnswerNo(wOwner?.offerStorage)) {
      if (!wOwner?.offerStorage?.pricePerPalet) {
        missingFields.push("offerStorage.pricePerPalet");
      }
      if (!wOwner?.offerStorage?.pricePerCubicFeet) {
        missingFields.push("offerStorage.pricePerCubicFeet");
      }
    } else {
      if (!wOwner?.offerStorage?.answer) {
        missingFields.push("offerStorage.answer");
      }
    }
  }

  if (!wOwner?.handleShrink) missingFields.push("handleShrink");
  else {
    if (!isAnswerNo(wOwner?.handleShrink)) {
      if (!wOwner?.handleShrink?.answer) {
        missingFields.push("handleShrink.answer");
      }
      if (!wOwner?.handleShrink?.small?.price) {
        missingFields.push("handleShrink.small.price");
      }
      if (!wOwner?.handleShrink?.medium?.price) {
        missingFields.push("handleShrink.medium.price");
      }
      if (!wOwner?.handleShrink?.large?.price) {
        missingFields.push("handleShrink.large.price");
      }
    } else {
      if (!wOwner?.handleShrink?.answer) {
        missingFields.push("handleShrink.answer");
      }
    }
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  if (
    wOwner?.password?.length < 6 ||
    !/[A-Z]/.test(wOwner.password) ||
    !/[!@#$%^&*]/.test(wOwner.password)
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "Password must meet the following criteria: Minimum 6 digits length, 1 UpperCase character, and one special character.",
    });
  }

  try {
    // const addNewUserResponse
    const createUserResponse = await UserService.registerUser({
      firstName: wOwner.name,
      lastName: wOwner.businessName,
      email: wOwner.email.toLowerCase(),
      username: wOwner.email.toLowerCase(),
      password: wOwner.password,
      billingID: "warehouse-owner-billing-id-not-needed",
      plan: "none",
      endDate: null,
      role: "warehouseOwner",
      phoneNumber: wOwner.phoneNumber,
    });

    console.log(
      `A new user signed up and addded to DB from Warehouse management. The ID for ${wOwner.email.toLowerCase()} is ${JSON.stringify(
        createUserResponse
      )}`
    );
    const currentUserWarehouses = await WOwnersService.getWarehousesForThisUser(
      {
        email: wOwner.email.toLowerCase(),
      }
    );

    if (
      createUserResponse?.status === "error" &&
      currentUserWarehouses?.warehouses
    ) {
      const updateWarehousesForExistingOwnerResponse =
        await WOwnersService.updateWarehousesInDBForExistingOwner({
          wOwner,
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
    } else {
      const mailBody = emailTemplates.welcomeMailBody(from_who, wOwner.email);

      mailgun.messages().send(mailBody, (sendError, body) => {
        if (sendError) {
          console.log(sendError);
        }
        console.log(body);
      });

      console.log(createUserResponse);

      const addWOwnerResponse = await WOwnersService.addWOwnerToDatabase({
        wOwner,
      });

      if (addWOwnerResponse?.status === "error") {
        return res.status(400).json({
          ...addWOwnerResponse,
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Successfully added Warehouse Owner to the database!`,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const getAll = async (req, res) => {
  const { loggedInEmail } = req.query;
  if (!loggedInEmail || loggedInEmail !== "franco@peri-mail.com") {
    return res.status(403).json({
      status: "error",
      message: "Sorry, you cannot retrieve the WH data!",
    });
  }
  try {
    const existingWOwnersResponse = await WOwnersService.getAllWOwnersFromDB();

    res.status(200).json({
      status: "success",
      message: "Successfully retrieved all Warehouses",
      response: existingWOwnersResponse,
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "There was an error processing your request.",
    });
  }
};

const deleteWOwner = async (req, res) => {
  const { email, _id } = req.body;

  if (!_id || !email) {
    console.log(
      "No ID or EMAIL has been provided, so we don't know which Warehouse Owner to delete!"
    );

    return res.status(400).json({
      status: "errror",
      message:
        "No ID or EMAIL has been provided, so we don't know which Warehouse Owner to delete!",
    });
  }

  try {
    const deleteWOwnerResponse =
      await WOwnersService.deleteWOwnerFromSpecificUser({
        email: email.toLowerCase(),
        _id,
      });

    if (deleteWOwnerResponse?.status === "error") {
      console.log(deleteWOwnerResponse);
      return res.status(400).json({
        ...deleteWOwnerResponse,
      });
    } else {
      console.log(deleteWOwnerResponse);

      return res.status(200).json({
        status: "success",
        message: `Successfully deleted warehouse owner with id ${_id}`,
        response: deleteWOwnerResponse ? deleteWOwnerResponse : [],
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  getAll,
  add,
  deleteWOwner,
};
