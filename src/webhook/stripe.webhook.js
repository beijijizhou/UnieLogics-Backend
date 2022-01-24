const Stripe = require("../connect/stripe");
const UserService = require("../users");

const stripeWebhook = async (req, res) => {
  let event;

  try {
    event = Stripe.createWebhook(req.body, req.header("Stripe-Signature"));
  } catch (err) {
    console.log(err);
    return res.sendStatus(400);
  }

  const data = event.data.object;

  console.log("#######-WEBHOOK HERE START-#######");
  console.log(event.type, data);
  console.log("#######-WEBHOOK HERE END-#######");

  switch (event.type) {
    case "customer.created":
      console.log(JSON.stringify(data));
      break;
    case "invoice.paid":
      break;
    case "customer.subscription.created": {
      const user = await UserService.getUserByBillingID(data.customer);

      if (data.plan.id === process.env.PLAN_17) {
        console.log("You are talking about plan17 product");
        user.plan = "plan17";
      }

      if (data.plan.id === process.env.PLAN_163) {
        console.log("You are talking about plan163 product");
        user.plan = "plan163";
      }

      user.hasTrial = true;
      user.endDate = new Date(data.current_period_end * 1000);

      await user.save();

      break;
    }
    case "customer.subscription.updated": {
      // started trial
      const user = await UserService.getUserByBillingID(data.customer);

      if (data.plan.id == process.env.PLAN_17) {
        console.log("You are talking about plan17 product");
        user.plan = "plan17";
      }

      if (data.plan.id === process.env.PLAN_163) {
        console.log("You are talking about plan163 product");
        user.plan = "plan163";
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
};

module.exports = {
  stripeWebhook,
};
