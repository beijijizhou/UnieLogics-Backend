const stripe = require("stripe");

const Stripe = stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

const createCheckoutSession = async (customerID, price) => {
  const session = await Stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerID,
    line_items: [
      {
        price,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: process.env.TRIAL_DAYS,
    },
    allow_promotion_codes: true,
    success_url: `${process.env.DOMAIN}/thank-you-page?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/checkout-error`,
  });

  return session;
};

const createBillingSession = async (customer) => {
  const session = await Stripe.billingPortal.sessions.create({
    customer,
    return_url: "https://www.unielogics.com/profile",
  });
  return session;
};

const getCustomerByID = async (id) => {
  const customer = await Stripe.customers.retrieve(id);
  return customer;
};

const getSubscription = async (id) => {
  // console.log(await Stripe.subscriptions.list({ customer: id }));
  const subscription = await Stripe.subscriptions.list({ customer: id });
  return subscription;
};

const addNewCustomer = async (email, referral) => {
  const customerObject = {
    email,
    description: "New Customer",
  };

  console.log(
    referral
      ? `We have an affiliate link with client reference id ${referral}`
      : `No affiliate link was present when client subscribed with email ${email}`
  );

  if (referral) {
    customerObject["metadata"] = { referral };
  }

  const customer = await Stripe.customers.create(customerObject);

  return customer;
};

const createWebhook = (rawBody, sig) => {
  const event = Stripe.webhooks.constructEvent(
    rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  return event;
};

module.exports = {
  getCustomerByID,
  addNewCustomer,
  createCheckoutSession,
  createBillingSession,
  createWebhook,
  getSubscription,
};
