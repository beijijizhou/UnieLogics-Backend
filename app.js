require("dotenv").config();
require("./src/connect/mongodb");
const bodyParser = require("body-parser");
const express = require("express");
const session = require("express-session");
var MemoryStore = require("memorystore")(session);
const UserService = require("./src/user");
const Stripe = require("./src/connect/stripe");
const jwt = require("./src/_helpers/jwt");
var cors = require("cors");

const productToPriceMap = {
  basic: process.env.PRODUCT_BASIC,
  pro: process.env.PRODUCT_PRO,
};

const app = express();
app.use(cors());
app.use(jwt());
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(err.status).json({ status: "Unauthorized", message: err.message });
    return;
  }
  next();
});

app.use(
  session({
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    resave: false,
    secret: "keyboard cat",
  })
);

app.use("/webhook", bodyParser.raw({ type: "application/json" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/users", async function (req, res) {
  try {
    const users = await UserService.getAll();
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ status: "error", e });
  }
});

app.get("/checkAuthentication", async function (req, res) {
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

    if (existingSubscription.data.length !== 0) {
      existingSubscription.data.forEach(function (item) {
        if (item.status === "active" || item.status === "trialing") {
          hasActiveSubscription = true;
        }
      });

      if (existingSubscription.data[0].plan.id === process.env.PRODUCT_BASIC) {
        console.log("You are talking about basic product");
        user.plan = "basic";
      }

      if (existingSubscription.data[0].plan.id === process.env.PRODUCT_PRO) {
        console.log("You are talking about pro product");
        user.plan = "pro";
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
});

app.post("/register", async function (req, res) {
  const { firstName, lastName, email, username, password } = req.body;
  let customer = await UserService.getUserByEmail(email);
  let customerInfo = {};

  if (!email || !username || !password) {
    res
      .status(400)
      .json({ status: "error", message: "Email, Username and Password are mandatory! One of them is missing!" });
    return;
  }

  if (customer) {
    res.status(409).json({
      status: "error",
      message: "A user is already registered with this email address!",
    });
  } else {
    try {
      customerInfo = await Stripe.addNewCustomer(email);

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

      res.status(200).json({ status: "success", message: `Successfully created user: ${username}` });
    } catch (e) {
      console.log(e);
      res.status(500).json({ status: "error", e });
    }
  }
});

app.post("/authenticate", async function (req, res) {
  const { email, password } = req.body;
  let customer = await UserService.getUserByEmail(email);
  let customerInfo = {};
  console.log(customer);

  if (customer) {
    try {
      const user = await UserService.authenticate(email, password);
      customerInfo = await Stripe.getCustomerByID(customer.billingID);
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
        ? res.status(200).json({ ...user, hasActiveSubscription, hasTrial })
        : res.status(401).json({ status: "error", message: "Email or password is incorrect" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ status: "error", message: JSON.stringify(e) });
    }
  } else {
    res.status(403).json({ status: "error", message: "This username does not exist! Please register first!" });
  }
});

app.post("/checkout", async (req, res) => {
  const { product, customerID } = req.body;
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

  try {
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
});

app.post("/profileUpdate", async (req, res) => {
  const { firstName, lastName, email } = req.body;
  console.log("here");
  console.log(firstName);
  console.log(lastName);
  console.log(email);
  if (!firstName || !lastName || !email) {
    return res.status(403).send({
      status: "error",
      message: "FirstName, LastName, Email are mandatory!",
    });
  }

  try {
    const user = await UserService.getUserByEmail(email);
    const update = {
      firstName,
      lastName,
    };

    await UserService.updateProfile(email, update);

    const editedUser = await UserService.getUserByEmail(email);
    console.log(user);
    console.log(editedUser);
    return res.status(200).json({
      status: "successs",
      user: editedUser,
      hasActiveSubscription: user.hasActiveSubscription,
    });
  } catch (e) {
    console.log(e);
    return res.status(403).send({
      status: "error",
      error: e,
    });
  }
});

app.get("/profile", async (req, res) => {
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

    if (existingSubscription.data.length !== 0) {
      existingSubscription.data.forEach(function (item) {
        if (item.status === "active" || item.status === "trialing") {
          hasActiveSubscription = true;
        }
      });

      if (existingSubscription.data[0].plan.id === process.env.PRODUCT_BASIC) {
        console.log("You are talking about basic product");
        user.plan = "basic";
      }

      if (existingSubscription.data[0].plan.id === process.env.PRODUCT_PRO) {
        console.log("You are talking about pro product");
        user.plan = "pro";
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
      user,
      hasActiveSubscription,
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
});

app.post("/billing", async (req, res) => {
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
});

app.post("/webhook", async (req, res) => {
  let event;

  try {
    event = Stripe.createWebhook(req.body, req.header("Stripe-Signature"));
  } catch (err) {
    console.log(err);
    return res.sendStatus(400);
  }

  const data = event.data.object;

  console.log(event.type, data);
  switch (event.type) {
    case "customer.created":
      console.log(JSON.stringify(data));
      break;
    case "invoice.paid":
      break;
    case "customer.subscription.created": {
      const user = await UserService.getUserByBillingID(data.customer);

      if (data.plan.id === process.env.PRODUCT_BASIC) {
        console.log("You are talking about basic product");
        user.plan = "basic";
      }

      if (data.plan.id === process.env.PRODUCT_PRO) {
        console.log("You are talking about pro product");
        user.plan = "pro";
      }

      user.hasTrial = true;
      user.endDate = new Date(data.current_period_end * 1000);

      await user.save();

      break;
    }
    case "customer.subscription.updated": {
      // started trial
      const user = await UserService.getUserByBillingID(data.customer);

      if (data.plan.id == process.env.PRODUCT_BASIC) {
        console.log("You are talking about basic product");
        user.plan = "basic";
      }

      if (data.plan.id === process.env.PRODUCT_PRO) {
        console.log("You are talking about pro product");
        user.plan = "pro";
      }

      const isOnTrial = data.status === "trialing";

      if (isOnTrial) {
        user.hasTrial = true;
        user.endDate = new Date(data.current_period_end * 1000);
      } else if (data.status === "active") {
        user.hasTrial = false;
        user.endDate = new Date(data.current_period_end * 1000);
      }

      if (data.canceled_at) {
        // cancelled
        console.log("You just canceled the subscription" + data.canceled_at);
        user.plan = "none";
        user.hasTrial = false;
        user.endDate = null;
      }
      console.log("actual", user.hasTrial, data.current_period_end, user.plan);

      await user.save();
      console.log("customer changed", JSON.stringify(data));
      break;
    }
    default:
  }
  res.sendStatus(200);
});

const port = process.env.PORT || 4242;

app.listen(port, () => console.log(`Listening on port ${port}!`));
