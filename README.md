# Recurring Subscriptions Billing using Stripe API

## Clone the project

Clone the project at: [https://github.com/bdcorps/stripe-subscriptions-nodejs](https://github.com/bdcorps/stripe-subscriptions-nodejs)

```bash
git clone https://github.com/bdcorps/stripe-subscriptions-nodejs
```

## Setting up the project

Rename the .env.example to .env. We will replace the variables in the file one-by-one.

```bash
STRIPE_SECRET_KEY=sk_test_51H8rImAkSQQctVkLmiefLPUxZhQdclj8BqTZuvHelgyQWum4COBNcIYP8viiH5dFBrEhM69Yt7Tc0hj8o26k9Pbs00tIYJkZvS
PLAN_17=price_1HcIFWAkSQQctVkLizPQ2Oum
PLAN_163=price_1HdI8dAkSQQctVkLD9IeOYjS
PLAN_37=price_1L5atCCyns2nFpoZfVZdTvlx
PLAN_287=price_1L5auQCyns2nFpoZ9az7MC6u
MONGODB=mongodb://localhost:27017/asinmice
STRIPE_WEBHOOK_SECRET=whsec_rYanPBSdQSswHjizrBz2pHAo6iYa2Ows
TRIAL_DAYS=14
DOMAIN=http://localhost:4242
JWT_SECRET="THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING"

update domaine to redirect user after payment and update https://dashboard.stripe.com/test/settings/billing/portal in live mode
```

## Set up Stripe

1. Create a new Stripe account [here](https://dashboard.stripe.com/register).
2. Add a name for your account by clicking the `Add a name` button on the top left.
3. Copy Secret Key under Developers > API Keys and paste in .env file as the STRIPE_SECRET_KEY.
4. Replace the `publishableKey` in `public/js/account.js` with your own from Developers > API Keys.

## Add products: Basic and Pro

1. Add a new product by clicking on the `Product` button on the left side. Call the first one, Product – Basic. Set the Pricing to $10.00 CAD and `Recurring`. Set the Billing period to `Monthly`.

[Image]

2. Copy the Price API ID and assign it to PLAN_17 in the .env file.

3. Repeat the process above for Product – Pro at $12.00 CAD, `Recurring`, and `Monthly`.

4. Copy the Price API ID and assign it to PLAN_163 in the .env file.

5. Set a Trial Period with the TRIAL_DAYS in the .env file.

## Start the MongoDB

Install MongoDB Community Edition from here. Run it by using,

```bash
mongod

locally run: sudo mongod --dbpath /System/Volumes/Data/data/db
```

The Mongo Server will start running at mongodb://localhost: 27017. We will use the `users` collection to save the customer information.

If you have an external Mongo server running, replace the default connection string referenced in the MONGODB in .env file.

## Set up the Stripe Webhook

Download Stripe CLI.

```bash
stripe listen --forward-to localhost:4242/webhook
```

Copy the webhook secret and assign it to STRIPE_WEBHOOK_SECRET in .env file.

## Start

npm start
