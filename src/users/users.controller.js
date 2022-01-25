const bcrypt = require("bcryptjs");
const mailgun = require("mailgun-js")({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });
const Stripe = require("../connect/stripe");

const UserService = require("../users");
const emailTemplates = require("../_helpers/emailTemplates");
const from_who = "donotreply@asinmice.com";

const productToPriceMap = {
  plan17: process.env.PLAN_17,
  plan163: process.env.PLAN_163,
};

const getAllUsers = async (req, res) => {
  const users = await UserService.getAll();
  if (users) {
    res.status(200).json(users);
  } else {
    res.status(400).json({
      message: "Bad request",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.query;

  try {
    let customer = await UserService.getUserByEmail(email);

    if (!customer) {
      return res.status(400).send({
        status: "error",
        error: {
          message: "User does not exist",
        },
      });
    }

    const randomPassword = Math.random().toString(36).substring(7);
    customer.hash = bcrypt.hashSync(randomPassword, 10);
    await customer.save();

    console.log(email + " - wants to reset his password!");

    const mailBody = emailTemplates.forgotPasswordMailBody(from_who, email, randomPassword);

    mailgun.messages().send(mailBody, (sendError, body) => {
      if (sendError) {
        console.log(sendError);
        return;
      }
      console.log(body);
    });
    return res.status(200).json({
      status: "success",
      message: "Successfully reset your password. Please check your email for your temporary password.",
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      status: "error",
      error: {
        message: e.raw.message,
      },
    });
  }
};

const checkAuthentication = async (req, res) => {
  const { email, customerID } = req.query;

  if (!email || !customerID) {
    return res.status(400).send({
      status: "error",
      error: {
        message: "Email or customer ID not present!",
      },
    });
  }

  try {
    const existingSubscription = await Stripe.getSubsription(customerID);
    let user = await UserService.getUserByEmail(email);
    let hasActiveSubscription = false;

    if (user.role === "admin") {
      hasActiveSubscription = true;

      user.hasActiveSubscription = true;
      user.plan = "plan163";
      user.hasTrial = false;
      user.endDate = null;
      user.salesPerMonthCheck = "9999";

      await user.save();

      return res.status(200).json({
        status: "successs",
        hasActiveSubscription,
        salesPerMonthCheck: user.salesPerMonthCheck,
      });
    }

    if (!user) {
      return res.status(400).send({
        status: "error",
        error: {
          message: "User does not exist",
        },
      });
    }

    if (existingSubscription.data.length !== 0) {
      existingSubscription.data.forEach(function (item) {
        if (item.status === "active" || item.status === "trialing") {
          hasActiveSubscription = true;
        }
      });

      if (existingSubscription.data[0].plan.id === process.env.PLAN_17) {
        console.log("You are talking about plan17 product");
        user.plan = "plan17";
      }

      if (existingSubscription.data[0].plan.id === process.env.PLAN_163) {
        console.log("You are talking about plan163 product");
        user.plan = "plan163";
      }
      if (existingSubscription.data[0].status === "trialing") {
        user.hasTrial = true;
        user.endDate = new Date(existingSubscription.data.trial_end * 1000);
      } else if (existingSubscription.data[0].status === "active") {
        user.hasTrial = false;
      } else {
        user.hasActiveSubscription = false;
        user.plan = "none";
        user.hasTrial = false;
        user.endDate = null;
      }
    } else {
      user.hasActiveSubscription = false;
      user.plan = "none";
      user.hasTrial = false;
      user.endDate = null;
      await user.save();
    }

    return res.status(200).json({
      status: "successs",
      hasActiveSubscription,
      salesPerMonthCheck: user.salesPerMonthCheck,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      status: "error",
      error: {
        message: e.raw.message,
      },
    });
  }
};

const register = async (req, res) => {
  const { firstName, lastName, email, username, password, referral } = req.body;
  let customer = await UserService.getUserByEmail(email);
  let customerInfo = {};

  if (!email || !username || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "Email, Username and Password are mandatory! One of them is missing!" });
  }

  if (customer) {
    return res.status(409).json({
      status: "error",
      message: "A user is already registered with this email address!",
    });
  } else {
    try {
      customerInfo = await Stripe.addNewCustomer(email, referral);

      customer = await UserService.registerUser({
        firstName,
        lastName,
        email,
        username,
        password,
        billingID: customerInfo.id,
        plan: "none",
        endDate: null,
        role: "user",
      });

      console.log(`A new user signed up and addded to DB. The ID for ${email} is ${JSON.stringify(customerInfo)}`);

      console.log(`User also added to DB. Information from DB: ${customer}`);

      const mailBody = emailTemplates.welcomeMailBody(from_who, email);

      mailgun.messages().send(mailBody, (sendError, body) => {
        if (sendError) {
          console.log(sendError);
          return;
        }
        console.log(body);
      });

      res.status(200).json({ status: "success", message: `Successfully created user: ${username}` });
    } catch (e) {
      console.log(e);
      res.status(500).json({ status: "error", e });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  let customer = await UserService.getUserByEmail(email);
  let customerInfo = {};
  console.log(customer);

  if (customer) {
    try {
      const user = await UserService.authenticate(email, password);
      customerInfo = await Stripe.getCustomerByID(customer.billingID);
      console.log(customer);
      const existingSubscription = await Stripe.getSubsription(customerInfo.id);
      let hasActiveSubscription = false;
      let hasTrial = false;

      existingSubscription.data.forEach(function (item) {
        if (item.status === "active" || item.status === "trialing") {
          hasActiveSubscription = true;
        }
        if (item.status === "trialing") {
          hasTrial = true;
        }
      });

      if (hasActiveSubscription) {
        console.log("hasActiveSubscription value is", hasActiveSubscription);
        customer.hasTrial = hasTrial;
        customer.hasActiveSubscription = hasActiveSubscription;
        customer.save();
      } else {
        console.log(
          "no trial information",
          customer.hasTrial,
          customer.plan != "none",
          customer.endDate < new Date().getTime()
        );
      }

      console.log(`The existing ID for ${email} is ${JSON.stringify(customerInfo)}`);

      user
        ? res
            .status(200)
            .json({ ...user, hasActiveSubscription, hasTrial, salesPerMonthCheck: customer.salesPerMonthCheck })
        : res.status(403).json({ status: "error", message: "Email or password is incorrect" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ status: "error", message: JSON.stringify(e) });
    }
  } else {
    res.status(403).json({ status: "error", message: "This username does not exist! Please register first!" });
  }
};

const checkout = async (req, res) => {
  const { product, customerID } = req.body;

  try {
    const customerInfo = await Stripe.getCustomerByID(customerID);
    let customer = await UserService.getUserByEmail(customerInfo.email);
    const price = productToPriceMap[product];
    const existingSubscription = await Stripe.getSubsription(customerInfo.id);

    existingSubscription.data.forEach(function (item) {
      if (item.status === "active" || item.status === "trialing") {
        return res.status(403).send({
          status: "error",
          error: {
            message: "User already has a subscription!",
          },
        });
      }
    });
    const session = await Stripe.createCheckoutSession(customerID, price);

    const ms = new Date().getTime() + 1000 * 60 * 60 * 24 * process.env.TRIAL_DAYS;
    const n = new Date(ms);

    customer.plan = product;
    customer.hasTrial = true;
    customer.hasActiveSubscription = true;
    customer.endDate = n;
    customer.save();

    res.status(200).send({
      status: "success",
      sessionId: session.id,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
};

const profileUpdate = async (req, res) => {
  const { firstName, lastName, email, password, notifications } = req.body;

  if (!firstName && !lastName && !email && !password) {
    return res.status(403).send({
      status: "error",
      message: "At least one of the next fields: FirstName, LastName, Email, Password are mandatory!",
    });
  }

  try {
    const user = await UserService.getUserByEmail(email);
    const update = {
      firstName,
      lastName,
      notifications,
    };

    await UserService.updateProfile(email, update, password);

    const editedUser = await UserService.getUserByEmail(email);
    return res.status(200).json({
      status: "successs",
      user: {
        plan: editedUser.plan,
        hasTrial: editedUser.hasTrial,
        endDate: editedUser.endDate,
        role: editedUser.role,
        hasActiveSubscription: editedUser.hasActiveSubscription,
        _id: editedUser._id,
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        email: editedUser.email,
        billingID: editedUser.billingID,
        notifications: editedUser.notifications,
        salesPerMonthCheck: editedUser.salesPerMonthCheck,
      },
      hasActiveSubscription: user.hasActiveSubscription,
    });
  } catch (e) {
    console.log(e);
    return res.status(403).send({
      status: "error",
      error: e,
    });
  }
};

const profile = async (req, res) => {
  const { email, customerID } = req.query;

  if (!email || !customerID) {
    return res.status(400).send({
      status: "error",
      error: {
        message: "Email or customer ID not present!",
      },
    });
  }

  try {
    const existingSubscription = await Stripe.getSubsription(customerID);
    let user = await UserService.getUserByEmail(email);
    let hasActiveSubscription = false;

    if (!user) {
      return res.status(400).send({
        status: "error",
        error: {
          message: "User does not exist",
        },
      });
    }

    if (user.role === "admin") {
      hasActiveSubscription = true;

      user.hasActiveSubscription = true;
      user.plan = "plan163";
      user.hasTrial = false;
      user.endDate = null;
      user.salesPerMonthCheck = "9999";

      await user.save();

      return res.status(200).json({
        status: "successs",
        user: {
          plan: user.plan,
          hasTrial: user.hasTrial,
          endDate: user.endDate,
          role: user.role,
          hasActiveSubscription,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          billingID: user.billingID,
          notifications: user.notifications,
          salesPerMonthCheck: user.salesPerMonthCheck,
        },
        hasActiveSubscription,
      });
    }

    if (existingSubscription.data.length !== 0) {
      existingSubscription.data.forEach(function (item) {
        if (item.status === "active" || item.status === "trialing") {
          hasActiveSubscription = true;
        }
      });

      if (existingSubscription.data[0].plan.id === process.env.PLAN_17) {
        console.log("You are talking about plan17 product");
        user.plan = "plan17";
        user.salesPerMonthCheck = 2500;
      }

      if (existingSubscription.data[0].plan.id === process.env.PLAN_163) {
        console.log("You are talking about plan163 product");
        user.plan = "plan163";
        user.salesPerMonthCheck = 5000;
      }
      if (existingSubscription.data[0].status === "trialing") {
        user.hasTrial = true;
        user.endDate = new Date(existingSubscription.data.trial_end * 1000);
      } else if (existingSubscription.data[0].status === "active") {
        user.hasTrial = false;
      } else {
        user.hasActiveSubscription = false;
        user.plan = "none";
        user.hasTrial = false;
        user.endDate = null;
      }
      await UserService.updateProfile(email, user);
    } else {
      user.hasActiveSubscription = false;
      user.plan = "none";
      user.hasTrial = false;
      user.endDate = null;
      await user.save();
    }

    return res.status(200).json({
      status: "successs",
      user: {
        plan: user.plan,
        hasTrial: user.hasTrial,
        endDate: user.endDate,
        role: user.role,
        hasActiveSubscription: user.hasActiveSubscription,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        billingID: user.billingID,
        notifications: user.notifications,
        salesPerMonthCheck: user.salesPerMonthCheck,
      },
      hasActiveSubscription: user.hasActiveSubscription,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      status: "error",
      error: {
        message: e.raw.message,
      },
    });
  }
};

const billing = async (req, res) => {
  const { customer } = req.body;
  console.log("customer", customer);

  try {
    const session = await Stripe.createBillingSession(customer);
    console.log("session", session);

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.log(e);
    return res.status(403).send({
      status: "error",
      error: {
        message: e.raw.message,
      },
    });
  }
};

const getSalesPerMonth = async (req, res) => {
  const { email } = req.query;

  try {
    const user = await UserService.getUserByEmail(email);
    console.log("Sales per month interogated by ", email);

    if (user) {
      console.log("Current available sales per month are: ", user.salesPerMonthCheck);
      return res.status(200).send({
        status: "success",
        salesPerMonthCheck: user.salesPerMonthCheck,
      });
    } else {
      return res.status(403).send({
        status: "error",
        error: {
          message: "No such user or email not sent correctly!",
        },
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(403).send({
      status: "error",
      error: {
        message: "User not found!",
      },
    });
  }
};

const updateSalesPerMonth = async (req, res) => {
  const { email, message } = req.body;
  console.log("Email for which you want to update sales per month is: ", email);
  console.log("Message to update is: ", message);

  if (!email || !message) {
    return res.status(400).send({
      status: "error",
      message: "Invalid request. Email or message not present",
    });
  } else if (message === "updateSalesPerMonth") {
    try {
      const user = await UserService.getUserByEmail(email);
      const update = {
        salesPerMonthCheck: user.salesPerMonthCheck - 1,
      };

      if (!user.salesPerMonthCheck || user.salesPerMonthCheck < 1) {
        return res.status(400).json({
          status: "error",
          message: "You don't have any salesPerMonth checks Available",
        });
      }

      const responseFromUpdate = await UserService.updateProfile(email, update);

      return res.status(200).send({
        status: "success",
        salesPerMonthCheck: responseFromUpdate.salesPerMonthCheck - 1,
      });
    } catch (e) {
      console.log(e);
      return res.status(403).send({
        status: "error",
        error: {
          message: "Update of sales per month encountered an error!",
          errorGenerated: e,
        },
      });
    }
  }
};

module.exports = {
  getAllUsers,
  forgotPassword,
  checkAuthentication,
  register,
  login,
  checkout,
  profileUpdate,
  profile,
  billing,
  getSalesPerMonth,
  updateSalesPerMonth,
};
