require("dotenv").config();
require("./src/connect/mongodb");

const bodyParser = require("body-parser");
const express = require("express");
const UserService = require("./src/user");
const jwt = require("./src/_helpers/jwt");
const cors = require("cors");

const usersRouter = require("./src/user/user.routes");
const stripeWebhook = require("./src/webhook/stripe.webhook.routes");

const app = express();

app
  .use(cors())
  .use(jwt())
  .use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
      res.status(err.status).json({ status: "Unauthorized", message: err.message });
      return;
    }
    next();
  })
  .use("/webhook", bodyParser.raw({ type: "application/json" }))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }));

//routes
app.use("/users", usersRouter);
app.use("/webhook", stripeWebhook);

const port = process.env.PORT || 4242;

app.listen(port, () => console.log(`Listening on port ${port}!`));
