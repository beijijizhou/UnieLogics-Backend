const ShipmentPlanService = require("../shipmentPlan");
const stripe = require("stripe");

const Stripe = stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

const createPaymentIntent = async (req, res) => {
  const { amount, customerId, shipmentPlanId, email } = req.body;

  try {
    let missingFields = [];
    const retrieveShipmentPlanById = await ShipmentPlanService.getShipmentPlanByIdFromDb({
      email,
      _id: shipmentPlanId,
    });
    console.log(retrieveShipmentPlanById);
    console.log(retrieveShipmentPlanById[0].products);

    if (retrieveShipmentPlanById?.length === 0 || !retrieveShipmentPlanById) {
      console.log(
        `wPayment.controller - Sorry, there are no Shipment Plans with id: ${shipmentPlanId} for user: ${email}`
      );
      return res.status(403).json({
        status: "error",
        message: `Sorry, there are no Shipment Plans with id: ${shipmentPlanId} for user: ${email}`,
      });
    }

    for (const key in retrieveShipmentPlanById[0]) {
      if (key === "products" && Array.isArray(retrieveShipmentPlanById[0][key])) {
        // For the 'products' array, iterate over each product and check for empty values
        retrieveShipmentPlanById[0][key].forEach((product, index) => {
          for (const productKey in product) {
            if (typeof product[productKey] === "object") {
              // For nested objects in products, iterate over their properties
              for (const nestedKey in product[productKey]) {
                if (
                  (productKey === "shrinkWrap" && product[productKey]?.answer) ||
                  (productKey === "specialPackaging" && product[productKey]?.answer)
                ) {
                  // Check if the corresponding 'amount' is empty
                  if (nestedKey === "amount" && product[productKey][nestedKey] === "") {
                    missingFields.push(`products[${index}].${productKey}.${nestedKey}`);
                  }
                } else if (
                  product[productKey]?.answer !== false &&
                  product[productKey][nestedKey] === "" &&
                  nestedKey !== "answer"
                ) {
                  // Exclude 'answer' field and other fields from being pushed when 'answer' is false
                  missingFields.push(`products[${index}].${productKey}.${nestedKey}`);
                }
              }
            } else if (product[productKey]?.answer !== false && product[productKey] === "" && productKey !== "answer") {
              // Exclude 'answer' field and other fields from being pushed when 'answer' is false
              missingFields.push(`products[${index}].${productKey}`);
            }
          }
        });
      } else if (typeof retrieveShipmentPlanById[0][key] === "object") {
        // For other nested objects, iterate over their properties
        for (const nestedKey in retrieveShipmentPlanById[0][key]) {
          if (retrieveShipmentPlanById[0][key][nestedKey] === "") {
            missingFields.push(`${key}.${nestedKey}`);
          }
        }
      } else if (retrieveShipmentPlanById[0][key] === "") {
        missingFields.push(key);
      }
    }
    //remove comments from checkinng
    missingFields = missingFields.filter((field) => !field.includes(".comments"));

    // If there are missing fields, return an error response
    if (missingFields.length > 0) {
      console.log(
        `wPayment.controller - Missing or empty fields (${missingFields.join(
          ", "
        )}) in Shipment Plan with id: ${shipmentPlanId} for user: ${email}`
      );
      return res.status(403).json({
        status: "error",
        message: `Missing or empty fields (${missingFields.join(
          ", "
        )}) in Shipment Plan with id: ${shipmentPlanId} for user: ${email}`,
      });
    }

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
