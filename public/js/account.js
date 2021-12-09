$(document).ready(function () {
  const publishableKey =
    "pk_test_51JzWNFCyns2nFpoZJ0pXCYaW99vwaqGBLXLjtHUAuIgRtz8vyB3cBtIj1ds9sqd0yU0kIzh1T1IDuV6CRgJgXKaO00qfuNM9Mg";

  const stripe = Stripe(
    publishableKey)
  const checkoutButton = $('#checkout-button')
  const manageBillingButton = $('#manage-billing-button')

  checkoutButton.click(function () {
    const product = $("input[name='product']:checked").val()

    fetch('/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'email': customer.email
      },
      body: JSON.stringify({
        product,
        customerID: customer.billingID
      })
    })
      .then((result) => result.json())
      .then(({ sessionId }) => stripe.redirectToCheckout({ sessionId }))
  })

  manageBillingButton.click(function () {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        email: customer.email
      },
      body: JSON.stringify({
        customer: customer.billingID
      })
    }

    fetch('/billing', requestOptions)
      .then((response) => response.json())
      .then((result) => window.location.replace(result.url))
      .catch((error) => console.log('error', error))
  })
})
