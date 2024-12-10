const bcrypt = require("bcryptjs");
const mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});
const Stripe = require("../connect/stripe");

const UserService = require("../users");
const emailTemplates = require("../_helpers/emailTemplates");
const from_who = "donotreply@unielogics.com";

const productToPriceMap = {
  plan17: process.env.PLAN_17,
  plan163: process.env.PLAN_163,
  plan37: process.env.PLAN_37,
  plan287: process.env.PLAN_287,
};

const { OAuth2Client } = require('google-auth-library');

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

    const mailBody = emailTemplates.forgotPasswordMailBody(
      from_who,
      email,
      randomPassword
    );

    mailgun.messages().send(mailBody, (sendError, body) => {
      if (sendError) {
        console.log(sendError);
        return;
      }
      console.log(body);
    });
    return res.status(200).json({
      status: "success",
      message:
        "Successfully reset your password. Please check your email for your temporary password.",
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
    const existingSubscription = await Stripe.getSubscription(customerID);
    let user = await UserService.getUserByEmail(email);
    let hasActiveSubscription = false;

    if (user.role === "admin" || user.role === "warehouseOwner") {
      hasActiveSubscription = true;

      user.hasActiveSubscription = true;
      user.plan = "plan163";
      user.hasTrial = false;
      user.endDate = null;
      user.salesPerMonthCheck = "9999";

      await user.save();

      return res.status(200).json({
        status: "success",
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

      if (existingSubscription.data[0].plan.id === process.env.PLAN_37) {
        console.log("You are talking about plan37 product");
        user.plan = "plan37";
      }

      if (existingSubscription.data[0].plan.id === process.env.PLAN_163) {
        console.log("You are talking about plan163 product");
        user.plan = "plan163";
      }

      if (existingSubscription.data[0].plan.id === process.env.PLAN_287) {
        console.log("You are talking about plan287 product");
        user.plan = "plan287";
      }

      if (existingSubscription.data[0].status === "trialing") {
        user.hasTrial = true;
        user.endDate = new Date(existingSubscription.data.trial_end * 1000);
      } else if (existingSubscription.data[0].status === "active") {
        user.hasTrial = false;
      } else {
        user.hasActiveSubscription = false;
        user.plan = user.plan === "free" ? user.plan : "none";
        user.hasTrial = false;
        user.endDate = null;
      }
    } else {
      user.hasActiveSubscription = false;
      user.plan = user.plan === "free" ? user.plan : "none";
      user.hasTrial = false;
      user.endDate = null;
      await user.save();
    }

    return res.status(200).json({
      status: "success",
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
  const {
    firstName,
    lastName,
    email,
    username,
    password,
    referral,
    phoneNumber,
    plan,
  } = req.body;
  let customer = await UserService.getUserByEmail(email.toLowerCase());
  let customerInfo = {};

  if (!email || !username || !password) {
    return res.status(400).json({
      status: "error",
      message:
        "Email, Username and Password are mandatory! One of them is missing!",
    });
  }

  if (customer) {
    return res.status(409).json({
      status: "error",
      message: "A user is already registered with this email address!",
    });
  } else {
    try {
      customerInfo = await Stripe.addNewCustomer(email.toLowerCase(), referral);

      customer = await UserService.registerUser({
        firstName,
        lastName,
        email: email.toLowerCase(),
        username,
        password,
        billingID: customerInfo.id,
        plan: plan === "free" ? plan : "none",
        endDate: null,
        role: "user",
        phoneNumber,
      });

      if (customer?.status === "error") {
        return res.status(403).json({
          ...customer,
        });
      }

      console.log(
        `A new user signed up and addded to DB. The ID for ${email.toLowerCase()} is ${JSON.stringify(
          customerInfo
        )}`
      );

      console.log(`User also added to DB. Information from DB: ${customer}`);

      const mailBody = emailTemplates.welcomeMailBody(from_who, email);

      mailgun.messages().send(mailBody, (sendError, body) => {
        if (sendError) {
          console.log(sendError);
          return;
        }
        console.log(body);
      });

      res.status(200).json({
        status: "success",
        message: `Successfully created user: ${username}`,
        user: {
          customerID: customerInfo.id,
        },
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ status: "error", e });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  let customer = await UserService.getUserByEmail(email.toLowerCase());
  let customerInfo = {};
  console.log(customer);

  if (customer) {
    try {
      const user = await UserService.authenticate(
        email.toLowerCase(),
        password
      );
      console.log(customer);
      let hasActiveSubscription = false;
      let hasTrial = false;

      if (customer.role !== "warehouseOwner") {
        customerInfo = await Stripe.getCustomerByID(customer.billingID);
        const existingSubscription = await Stripe.getSubscription(
          customerInfo.id
        );

        existingSubscription.data.forEach(function (item) {
          if (item.status === "active" || item.status === "trialing") {
            hasActiveSubscription = true;
          }
          if (item.status === "trialing") {
            hasTrial = true;
          }
        });
      } else {
        hasActiveSubscription = true;
      }

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

      console.log(
        `The existing ID for ${email.toLowerCase()} is ${JSON.stringify(
          customerInfo
        )}`
      );

      user
        ? res.status(200).json({
          ...user,
          hasActiveSubscription,
          hasTrial,
          salesPerMonthCheck: customer.salesPerMonthCheck,
        })
        : res.status(403).json({
          status: "error",
          message: "Email or password is incorrect",
        });
    } catch (e) {
      console.log(e);
      res.status(500).json({ status: "error", message: JSON.stringify(e) });
    }
  } else {
    res.status(403).json({
      status: "error",
      message: "This username does not exist! Please register first!",
    });
  }
};

const googleLogin = async(req, res) => {
  console.log("Google login in backend");
  const { client_id, credential } = req.body;
  if (!client_id || !credential) {
    return res.status(400).json({
      status: "error",
      message: "client id and credentials are mandatory!",
    });
  }
  
  try {
    // Verify and decode credential JWT token
    const client = new OAuth2Client(client_id);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: client_id,
    });
  
    // Payload contains basic user info (name, email, subject)
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || !payload.given_name || !payload.family_name) {
      return res.status(400).json({
        status: "error",
        message: "Missing google user information. Bad authentication request",
      });
    }
    console.log("got the payload", payload);
  
    // Create new oauth entry
    const googleOauth = {
      providerName: "google",
      providerId: payload.sub,
      token: credential,
    };
    
    // Get user
    let customer = await UserService.getUserByEmail(payload.email.toLowerCase());
    let customerInfo = {};
    console.log("customer?: ", customer);
    // Create user if they don't exist
    if (!customer) {
      console.log("user doent exist");
      try {
        const username = payload.email;
        const referral = "";
        customerInfo = await Stripe.addNewCustomer(payload.email.toLowerCase(), referral);

        let newUser = {
          firstName: payload.given_name,
          lastName: payload.family_name,
          email: payload.email,
          username: username,
          password: "oauth_password",
          billingID: customerInfo.id,
          plan: "none",
          endDate: null,
          role: "user",
          phoneNumber: null,
        };
        const user = await UserService.registerUser(newUser);
        const customer = await UserService.setOauth(payload.email, googleOauth);
  
        if (customer?.status === "error") {
          return res.status(403).json({
            ...customer,
          });
        }
  
        console.log(
          `A new user signed up and addded to DB. The ID for ${payload.email.toLowerCase()} is ${JSON.stringify(
            customerInfo
          )}`
        );
  
        console.log(`User also added to DB. Information from DB: ${customer}`);
  
        const mailBody = emailTemplates.welcomeMailBody(from_who, payload.email);
  
        mailgun.messages().send(mailBody, (sendError, body) => {
          if (sendError) {
            console.log(sendError);
            return;
          }
          console.log(body);
        });
      } catch (e) {
        console.log(e);
        res.status(500).json({ status: "error", e });
      }
    }
    // UserService._delete("674e9fbe6f08d24c04a88616");
    // console.log("User deleted");
    // Skip password check and log them in
    console.log("user exists");
    try {
      const user = await UserService.authenticate(
        payload.email.toLowerCase(),
        null,
        googleOauth,
      );
      console.log(customer);
      let hasActiveSubscription = false;
      let hasTrial = false;

      if (customer.role !== "warehouseOwner") {
        customerInfo = await Stripe.getCustomerByID(customer.billingID);
        const existingSubscription = await Stripe.getSubsription(
          customerInfo.id
        );

        existingSubscription.data.forEach(function (item) {
          if (item.status === "active" || item.status === "trialing") {
            hasActiveSubscription = true;
          }
          if (item.status === "trialing") {
            hasTrial = true;
          }
        });
      } else {
        hasActiveSubscription = true;
      }

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

      console.log(
        `The existing ID for ${payload.email.toLowerCase()} is ${JSON.stringify(
          customerInfo
        )}`
      );

      user
        ? res.status(200).json({
          ...user,
          hasActiveSubscription,
          hasTrial,
          salesPerMonthCheck: customer.salesPerMonthCheck,
        })
        : res.status(403).json({
          status: "error",
          message: "Email or password is incorrect",
        });
    } catch (e) {
      console.log(e);
      res.status(500).json({ status: "error", message: JSON.stringify(e) });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ 
      status: "error", 
      message: "Invalid token or authentication failed." 
    });
  }
};

const checkout = async (req, res) => {
  const { product, customerID } = req.body;

  try {
    const customerInfo = await Stripe.getCustomerByID(customerID);
    let customer = await UserService.getUserByEmail(
      customerInfo.email.toLowerCase()
    );
    const price = productToPriceMap[product];
    const existingSubscription = await Stripe.getSubscription(customerInfo.id);

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

    const ms =
      new Date().getTime() + 1000 * 60 * 60 * 24 * process.env.TRIAL_DAYS;
    const n = new Date(ms);

    console.log("Product selected by client is:" + product);
    // customer.plan = product;
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
  const { firstName, lastName, email, password, notifications, phoneNumber } =
    req.body;

  if (!firstName && !lastName && !email && !password) {
    return res.status(403).send({
      status: "error",
      message:
        "At least one of the next fields: FirstName, LastName, Email, Password are mandatory!",
    });
  }

  try {
    const user = await UserService.getUserByEmail(email.toLowerCase());
    const update = {
      firstName,
      lastName,
      notifications,
      phoneNumber,
    };

    await UserService.updateProfile(email.toLowerCase(), update, password);

    const editedUser = await UserService.getUserByEmail(email.toLowerCase());
    return res.status(200).json({
      status: "success",
      user: {
        plan: editedUser.plan,
        hasTrial: editedUser.hasTrial,
        endDate: editedUser.endDate,
        role: editedUser.role,
        hasActiveSubscription: editedUser.hasActiveSubscription,
        _id: editedUser._id,
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        email: editedUser.email.toLowerCase(),
        billingID: editedUser.billingID,
        notifications: editedUser.notifications,
        salesPerMonthCheck: editedUser.salesPerMonthCheck,
        phoneNumber: editedUser.phoneNumber,
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

const simpleProfile = async (req, res) => {
  const { email } = req.query;
  console.log(email);
  try {
    const user = await UserService.getUserByEmail(email.toLowerCase());
    if (user) {
      return res.status(200).send({
        status: "success",
        user: {
          customerID: user.billingID,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          hasActiveSubscription: user.hasActiveSubscription,
          plan: user.plan,
          role: user.role,
          token: user.token,
          survey: user.survey,
          phoneNumber: user.phoneNumber,
        },
      });
    } else {
      return res.status(404).send({
        status: "error",
        message: `We were not able to find any user with email: ${email}`,
      });
    }
  } catch (e) {
    return res.status(200).send({
      status: "success",
      message: "Unknown error while trying to get profile based on your email",
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
    const existingSubscription = await Stripe.getSubscription(customerID);
    let user = await UserService.getUserByEmail(email.toLowerCase());
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
        status: "success",
        user: {
          plan: user.plan,
          hasTrial: user.hasTrial,
          endDate: user.endDate,
          role: user.role,
          hasActiveSubscription,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email.toLowerCase(),
          billingID: user.billingID,
          customerID: user.billingID,
          notifications: user.notifications,
          salesPerMonthCheck: user.salesPerMonthCheck,
          phoneNumber: user.phoneNumber,
          survey: user.survey,
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

      if (existingSubscription.data[0].plan.id === process.env.PLAN_37) {
        console.log("You are talking about plan37 product");
        user.plan = "plan37";
        user.salesPerMonthCheck = 2500;
      }

      if (existingSubscription.data[0].plan.id === process.env.PLAN_163) {
        console.log("You are talking about plan163 product");
        user.plan = "plan163";
        user.salesPerMonthCheck = 5000;
      }

      if (existingSubscription.data[0].plan.id === process.env.PLAN_287) {
        console.log("You are talking about plan287 product");
        user.plan = "plan287";
        user.salesPerMonthCheck = 5000;
      }

      if (existingSubscription.data[0].status === "trialing") {
        user.hasTrial = true;
        user.endDate = new Date(existingSubscription.data.trial_end * 1000);
      } else if (existingSubscription.data[0].status === "active") {
        user.hasTrial = false;
      } else {
        user.hasActiveSubscription = false;
        user.plan = user.plan === "free" ? user.plan : "none";
        user.hasTrial = false;
        user.endDate = null;
      }
      await UserService.updateProfile(email, user);
    } else {
      user.hasActiveSubscription = false;
      user.plan = user.plan === "free" ? user.plan : "none";
      user.hasTrial = false;
      user.endDate = null;
      await user.save();
    }

    return res.status(200).json({
      status: "success",
      user: {
        plan: user.plan,
        hasTrial: user.hasTrial,
        endDate: user.endDate,
        role: user.role,
        hasActiveSubscription: user.hasActiveSubscription,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email.toLowerCase(),
        billingID: user.billingID,
        customerID: user.billingID,
        notifications: user.notifications,
        salesPerMonthCheck: user.salesPerMonthCheck,
        phoneNumber: user.phoneNumber,
        survey: user.survey,
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
    const user = await UserService.getUserByEmail(email.toLowerCase());
    console.log("Sales per month interogated by ", email.toLowerCase());

    if (user) {
      console.log(
        "Current available sales per month are: ",
        user.salesPerMonthCheck
      );
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
  console.log(
    "Email for which you want to update sales per month is: ",
    email.toLowerCase()
  );
  console.log("Message to update is: ", message);

  if (!email || !message) {
    return res.status(400).send({
      status: "error",
      message: "Invalid request. Email or message not present",
    });
  } else if (message === "updateSalesPerMonth") {
    try {
      const user = await UserService.getUserByEmail(email.toLowerCase());
      const update = {
        salesPerMonthCheck: user.salesPerMonthCheck - 1,
      };

      if (!user.salesPerMonthCheck || user.salesPerMonthCheck < 1) {
        return res.status(400).json({
          status: "error",
          message: "You don't have any salesPerMonth checks Available",
        });
      }

      const responseFromUpdate = await UserService.updateProfile(
        email.toLowerCase(),
        update
      );

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

const postSurvey = async (req, res) => {
  const { email, step1, step2 } = req.body;

  if (!email) {
    return res.status(400).send({
      status: "error",
      error: {
        message:
          "Please provide the email address for the user you want to update the survey for.",
      },
    });
  }
  if (!step1 || !step2) {
    return res.status(400).send({
      status: "error",
      error: {
        message:
          "Step1 or Step2 are not fully completed or one of them is missing, please try again!",
      },
    });
  } else {
    try {
      const user = await UserService.getUserByEmail(email.toLowerCase());
      if (!user) {
        return res.status(404).send({
          status: "error",
          error: {
            message: "We couldn't find a user with the provided email address!",
          },
        });
      }
      const updateObj = {
        survey: {
          step1,
          step2,
          completed: true,
        },
      };

      await UserService.updateProfile(email.toLowerCase(), updateObj);
      const updatedUser = await UserService.getUserByEmail(email.toLowerCase());

      return res.status(200).send({
        status: "success",
        user: updatedUser,
      });
    } catch (e) {
      return res.status(500).send({
        status: "error",
        error: {
          message: "Something went wrong while saving your survey",
        },
      });
    }
  }
};

const deleteUser = async (req, res) => {
	const { email, loggedInEmail } = req.body;
	try {
		if (loggedInEmail !== "franco@peri-mail.com") {
			return res.status(403).json({
				status: "error",
				message:
					"You cannot access this section with this email address. Only the admin can access it!",
			});
		}
		const user = await UserService.deleteUserByEmail(email);
		if (!user) {
			return res.status(404).send({
				status: "error",
				message: "User not found",
			});
		}
		return res.status(200).send({
			status: "success",
			message: "User deleted successfully",
		});
	} catch (e) {
		console.log(e);
	}
};

module.exports = {
  getAllUsers,
  forgotPassword,
  checkAuthentication,
  register,
  login,
  googleLogin,
  checkout,
  profileUpdate,
  profile,
  billing,
  getSalesPerMonth,
  updateSalesPerMonth,
  postSurvey,
  simpleProfile,
  deleteUser
};
