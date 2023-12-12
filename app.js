require("dotenv").config();
require("./src/connect/mongodb");

const bodyParser = require("body-parser");
const express = require("express");
const jwt = require("./src/_helpers/jwt");
const cors = require("cors");

const usersRouter = require("./src/users/users.routes");
const bucketsProductsRouter = require("./src/bucketsProducts/bucketsProducts.routes");
const foldersRouter = require("./src/folders/folders.routes");
const profProductsRouter = require("./src/profitableProductDetails/profProductDetails.routes");
const keepaRouter = require("./src/keepa/keepa.routes");
const brandsRouter = require("./src/brands/brands.routes");
const fLinksRouter = require("./src/fLinks/fLinks.routes");
const savedSearchesRouter = require("./src/savedSearches/savedSearches.routes");
const warehouseOwnersRouter = require("./src/wOwners/wOwners.routes");
const shipmentPlanRouter = require("./src/shipmentPlan/shipmentPlan.routes");
const suppliersRouter = require("./src/suppliers/suppliers.routes");
const wareHousePaymentRouter = require("./src/wPayment/wPayment.routes");
const stripeWebhook = require("./src/webhook/stripe.webhook.routes");

const app = express();
const path = require("path");

app
  .use(cors())
  .use(jwt())
  .use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
      res
        .status(err.status)
        .json({ status: "Unauthorized", message: err.message });
      return;
    }
    next();
  })
  .use("/webhook", bodyParser.raw({ type: "application/json" }))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, "uploads");
console.log("Resolved uploads path:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));

//routes
app.use("/users", usersRouter);
app.use("/buckets", bucketsProductsRouter);
app.use("/folders", foldersRouter);
app.use("/profProducts", profProductsRouter);
app.use("/keepa", keepaRouter);
app.use("/brands", brandsRouter);
app.use("/fLinks", fLinksRouter);
app.use("/savedSearches", savedSearchesRouter);
app.use("/wOwners", warehouseOwnersRouter);
app.use("/shipmentPlan", shipmentPlanRouter);
app.use("/suppliers", suppliersRouter);
app.use("/wPayment", wareHousePaymentRouter);
app.use("/webhook", stripeWebhook);

const port = process.env.PORT || 4242;

app.listen(port, () => console.log(`Listening on port ${port}!`));
