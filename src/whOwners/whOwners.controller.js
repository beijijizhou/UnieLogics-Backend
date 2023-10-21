const WhOwnersService = require("../whOwners");
const UserService = require("../users");
const emailTemplates = require("../_helpers/emailTemplates");
const mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});
const from_who = "donotreply@asinmice.com";

const add = async (req, res) => {
  const { loggedInEmail, whOwner } = req.body;

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

  if (!whOwner) missingFields.push("whOwner");
  if (!whOwner?.name) missingFields.push("name");
  if (!whOwner?.password) missingFields.push("password");
  if (!whOwner?.email) missingFields.push("email");
  if (!whOwner?.phoneNumber) missingFields.push("phoneNumber");
  if (!whOwner?.llcName) missingFields.push("llcName");
  if (!whOwner?.businessName) missingFields.push("businessName");
  if (!whOwner?.businessAddress) missingFields.push("businessAddress");
  if (!whOwner?.businessPhoneNumber) missingFields.push("businessPhoneNumber");
  if (!whOwner?.customerServiceEmailAddress)
    missingFields.push("customerServiceEmailAddress");
  if (!whOwner?.costPerItemLabeling) missingFields.push("costPerItemLabeling");
  if (!whOwner?.costPerBoxClosing) missingFields.push("costPerBoxClosing");
  if (!whOwner?.costPerBox.length) missingFields.push("costPerBox");

  if (!whOwner.handleHazmat) missingFields.push("handleHazmat");
  else {
    if (!isAnswerNo(whOwner.handleHazmat)) {
      if (!whOwner.handleHazmat?.pricePerItem) {
        missingFields.push("handleHazmat.pricePerItem");
      }
    } else {
      if (!whOwner.handleHazmat?.answer) {
        missingFields.push("handleHazmat.answer");
      }
    }
  }

  if (!whOwner.bubbleWrapping) missingFields.push("bubbleWrapping");
  else {
    if (!isAnswerNo(whOwner.bubbleWrapping)) {
      if (!whOwner.bubbleWrapping?.pricePerItem) {
        missingFields.push("bubbleWrapping.pricePerItem");
      }
    } else {
      if (!whOwner.bubbleWrapping?.answer) {
        missingFields.push("bubbleWrapping.answer");
      }
    }
  }

  if (!whOwner.offerStorage) missingFields.push("offerStorage");
  else {
    if (!isAnswerNo(whOwner.offerStorage)) {
      if (!whOwner.offerStorage?.pricePerPalet) {
        missingFields.push("offerStorage.pricePerPalet");
      }
      if (!whOwner.offerStorage?.pricePerCubicFeet) {
        missingFields.push("offerStorage.pricePerCubicFeet");
      }
    } else {
      if (!whOwner.offerStorage?.answer) {
        missingFields.push("offerStorage.answer");
      }
    }
  }

  if (!whOwner.handleShrink) missingFields.push("handleShrink");
  else {
    if (!isAnswerNo(whOwner.handleShrink)) {
      if (!whOwner.handleShrink?.answer) {
        missingFields.push("handleShrink.answer");
      }
      if (!whOwner.handleShrink?.small?.price) {
        missingFields.push("handleShrink.small.price");
      }
      if (!whOwner.handleShrink?.medium?.price) {
        missingFields.push("handleShrink.medium.price");
      }
      if (!whOwner.handleShrink?.large?.price) {
        missingFields.push("handleShrink.large.price");
      }
    } else {
      if (!whOwner.handleShrink?.answer) {
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
    whOwner.password.length < 6 ||
    !/[A-Z]/.test(whOwner.password) ||
    !/[!@#$%^&*]/.test(whOwner.password)
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
      firstName: whOwner.name,
      lastName: whOwner.businessName,
      email: whOwner.email.toLowerCase(),
      username: whOwner.email.toLowerCase(),
      password: whOwner.password,
      billingID: "wharehouse-owner-billing-id-not-needed",
      plan: "none",
      endDate: null,
      role: "wharehouseOwner",
      phoneNumber: whOwner.phoneNumber,
    });

    console.log(
      `A new user signed up and addded to DB from Wharehouse management. The ID for ${whOwner.email.toLowerCase()} is ${JSON.stringify(
        createUserResponse
      )}`
    );
    const mailBody = emailTemplates.welcomeMailBody(from_who, whOwner.email);

    mailgun.messages().send(mailBody, (sendError, body) => {
      if (sendError) {
        console.log(sendError);
      }
      console.log(body);
    });

    console.log(createUserResponse);
    if (createUserResponse?.status === "error") {
      return res.status(400).json({
        ...createUserResponse,
      });
    }
    const addWhOwnerResponse = await WhOwnersService.addWhOwnerToDatabase({
      whOwner,
    });
    console.log(addWhOwnerResponse);

    if (addWhOwnerResponse?.status === "error") {
      return res.status(400).json({
        ...addWhOwnerResponse,
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully added Wharehouse Owner to the database!`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const getAll = async (req, res) => {
  const { page, itemsPerPage } = req.query;
  const { email } = req.body;
  if (!email || email !== "franco@peri-mail.com") {
    return res.status(403).json({
      status: "error",
      message: "Sorry, you cannot retrieve the WH data!",
      response: [],
    });
  }
  const allWhOwners = await WhOwnersService.getMaxItems();
  const maxPages =
    allWhOwners % itemsPerPage > 0
      ? parseInt(allWhOwners / itemsPerPage + 1)
      : allWhOwners / itemsPerPage;

  const whOwners = await WhOwnersService.getAll(
    page < 1 ? 1 : page,
    itemsPerPage
  );

  if (whOwners) {
    res.status(200).json({
      whOwners,
      maxPages,
      page,
      itemsPerPage,
    });
  } else {
    res.status(400).json({
      status: "error",
      message: "Bad request",
    });
  }
};

module.exports = {
  getAll,
  add,
};
