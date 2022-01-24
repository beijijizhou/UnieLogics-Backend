$(document).ready(function () {
  const publishableKey =
    "pk_live_51JzWNFCyns2nFpoZbrJhdK2AF3cLWlRhwUJOAZCWOV40dhszbDXTNIor27mgulcdDlXaNT5fltGSovq2qJCL583V00gWpnnXwR";

  const stripe = Stripe(publishableKey);
  const checkoutButton = $("#checkout-button");
  const manageBillingButton = $("#manage-billing-button");

  checkoutButton.click(function () {
    const product = $("input[name='product']:checked").val();

    fetch("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        email: customer.email,
      },
      body: JSON.stringify({
        product,
        customerID: customer.billingID,
      }),
    })
      .then((result) => result.json())
      .then(({ sessionId }) => stripe.redirectToCheckout({ sessionId }));
  });

  manageBillingButton.click(function () {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        email: customer.email,
      },
      body: JSON.stringify({
        customer: customer.billingID,
      }),
    };

    fetch("/billing", requestOptions)
      .then((response) => response.json())
      .then((result) => window.location.replace(result.url))
      .catch((error) => console.log("error", error));
  });
});
