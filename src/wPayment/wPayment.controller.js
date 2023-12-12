const stripe = require("stripe");

const Stripe = stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

const createPaymentIntent = async (req, res) => {
  const { amount, customerId, shipmentPlanId, email } = req.body;

  try {
    const paymentIntentSession = await Stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: customerId,
      customer_update: {
        address: "auto",
      },
      // payment_intent_data: {
      //   capture_method: "manual",
      // },
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Automatic warehouse management",
            },
            tax_behavior: "exclusive",
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${process.env.DOMAIN}/w-payment-thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/checkout-error`,
    });

    res.status(200).json({
      status: "success",
      message: "Successfully created Payment Intent",
      response: paymentIntentSession,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: "error",
      message: e?.raw?.message || "There was an error processing your request",
    });
  }
};

module.exports = {
  createPaymentIntent,
};
