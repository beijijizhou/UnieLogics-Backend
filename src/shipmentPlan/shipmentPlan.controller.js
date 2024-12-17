const ShipmentPlanService = require(".");
const WOwnersService = require("../wOwners");
const FileType = require("./fileTypesEnum");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const recordService = require('../infoplusRecords/records.service');
const supplierService = require('../suppliers/suppliers.service');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../..", "uploads");

    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

const add = async (req, res) => {
  const { email, shipmentTitle, products, supplier, orderNo, receiptNo, orderDate } = req.body;
  const missingFields = [];

  if (!email) missingFields.push("email");
  if (!shipmentTitle) missingFields.push("shipmentTitle");
  if (!products || !Array.isArray(products) || products.length === 0) {
    missingFields.push("products");
  } else {
    products.forEach((product, index) => {
      if (!product.asin) missingFields.push(`products[${index}].asin`);
      if (!product.title) missingFields.push(`products[${index}].title`);
      if (!product.dateAdded) missingFields.push(`products[${index}].dateAdded`);
      if (!product.amazonPrice) missingFields.push(`products[${index}].amazonPrice`);
      if (!product.imageUrl) missingFields.push(`products[${index}].imageUrl`);
    });
  }
  if (!supplier) missingFields.push(`supplier`);
  if (supplier) {
    if (!supplier.supplierAddress.lat)
      missingFields.push(`supplier.supplierAddress.lat`);
    if (!supplier.supplierAddress.long)
      missingFields.push(`supplier.supplierAddress.long`);
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  try {
    const existingShipmentPlansResponse = await ShipmentPlanService.getAllShipmentPlansFromDB({ email });

    if (!existingShipmentPlansResponse) {
      const addShipmentPlanToDBResponse = await ShipmentPlanService.addShipmentPlanToDB({
        email,
        shipmentTitle,
        products,
        supplier,
        orderNo,
        receiptNo,
        orderDate,
      });

      if (addShipmentPlanToDBResponse?.status === "error") {
        return res.status(400).json({
          ...addShipmentPlanToDBResponse,
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Successfully added Shipment Plan to the database.`,
        response: {
          planId: addShipmentPlanToDBResponse.shipmentPlans[0]._id,
        },
      });
    } else {
      const updateShipmentPlanResponse = await ShipmentPlanService.updateShipmentPlansForExistingEmailInDB({
        email,
        shipmentTitle,
        products,
        supplier,
        orderNo,
        receiptNo,
        orderDate,
      });

      console.log(updateShipmentPlanResponse);

      if (updateShipmentPlanResponse?.status === "error") {
        return res.status(400).json({
          ...updateShipmentPlanResponse,
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Successfully updated Shipment Plan for existing email.`,
        response: {
          planId: updateShipmentPlanResponse._id,
        },
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const getAll = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(403).json({
      status: "error",
      message: "Sorry, there was an error retriving your shipment plans!",
    });
  }
  try {
    const existingShipmentPlansResponse = await ShipmentPlanService.getAllShipmentPlansFromDB({ email });

    res.status(200).json({
      status: "success",
      message: "Successfully retrieved your Shipment Plans",
      response: !existingShipmentPlansResponse ? [] : existingShipmentPlansResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: "error",
      message: "There was an error processing your request.",
    });
  }
};

const deleteShipmentPlan = async (req, res) => {
  const { email, _id } = req.body;

  if (!_id || !email) {
    console.log("No ID or EMAIL has been provided, so we don't know which shipment plan to delete!");

    return res.status(400).json({
      status: "errror",
      message: "No ID or EMAIL has been provided, so we don't know which shipment plan to delete!",
    });
  }

  try {
    const deleteShipmentPlanResponse = await ShipmentPlanService.deleteShipmentPlanFromSpecificUser({
      email: email.toLowerCase(),
      _id,
    });

    if (deleteShipmentPlanResponse?.status === "error") {
      console.log(deleteShipmentPlanResponse);
      return res.status(400).json({
        ...deleteShipmentPlanResponse,
      });
    } else {
      console.log(deleteShipmentPlanResponse);

      return res.status(200).json({
        status: "success",
        message: `Successfully deleted supplier with id ${_id}`,
        response: deleteShipmentPlanResponse,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const getById = async (req, res) => {
  const { email, _id } = req.query;

  const missingFields = [];

  if (!email) missingFields.push("email");
  if (!_id) missingFields.push("_id");

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  try {
    const retrieveShipmentPlanById = await ShipmentPlanService.getShipmentPlanByIdFromDb({ email, _id });

    if (retrieveShipmentPlanById?.length === 0 || !retrieveShipmentPlanById) {
      return res.status(403).json({
        status: "error",
        message: `Sorry, there are no Shipment Plans with id: ${_id} for user: ${email}`,
        response: retrieveShipmentPlanById || [],
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved Shipment Plan with id ${_id}`,
      response: retrieveShipmentPlanById,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const updateShipmentPlan = async (req, res) => {
  const { email, shipmentPlanId, products, supplier, shipmentTitle, orderNo, receiptNo, orderDate, warehouseOwner, amazonData } =
    req.body;

  const missingFields = [];

  if (!email) missingFields.push("email");
  if (!shipmentPlanId) missingFields.push("shipmentPlanId");

  if (warehouseOwner) {
    if (!warehouseOwner._id) missingFields.push("warehouseOwner._id");
    if (!warehouseOwner.wOwnerEmail) missingFields.push("warehouseOwner.wOwnerEmail");
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  try {
    let fullWarehouseOwnerDetails = null;

    if (warehouseOwner) {
      fullWarehouseOwnerDetails = await WOwnersService.getSpecificWarehousesForThisUserById({
        email: warehouseOwner.wOwnerEmail.toLowerCase(),
        _id: warehouseOwner._id,
      });

      if (fullWarehouseOwnerDetails?.status === "error") {
        return res.status(403).json({
          ...fullWarehouseOwnerDetails,
        });
      }
    }

    const updateShipmentPlanResponse = await ShipmentPlanService.updateShipmentPlanBasedOnId({
      email,
      shipmentPlanId,
      shipmentTitle,
      products,
      supplier,
      orderNo,
      receiptNo,
      orderDate,
      warehouseOwner: fullWarehouseOwnerDetails,
      amazonData,
    });

    console.log("updateShipmentPlanResponse", updateShipmentPlanResponse);

    if (updateShipmentPlanResponse?.status === "error") {
      return res.status(400).json({
        ...updateShipmentPlanResponse,
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully updated Shipment Plan with id ${shipmentPlanId} for user: ${email}`,
      response: updateShipmentPlanResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const deleteProductFromShipmentPlan = async (req, res) => {
  const { email, shipmentPlanId, productId } = req.body;

  try {
    const deleteProductFromShipmentPlanResponse =
      await ShipmentPlanService.deleteProductFromShipmentPlanFromSpecificUser({
        email: email.toLowerCase(),
        shipmentPlanId,
        productId,
      });

    if (deleteProductFromShipmentPlanResponse?.status === "error") {
      console.log(deleteProductFromShipmentPlanResponse);
      return res.status(400).json({
        ...deleteProductFromShipmentPlanResponse,
      });
    } else if (deleteProductFromShipmentPlanResponse?.status === "conflict") {
      return res.status(200).json({
        status: "success",
        message: `Successfully deleted products from shipment plan with id: ${shipmentPlanId}, and shipment plan removed due to empty products.`,
        response: [],
      });
    } else {
      console.log(deleteProductFromShipmentPlanResponse);

      return res.status(200).json({
        status: "success",
        message: `Successfully deleted products from shipment plan with id: ${shipmentPlanId}`,
        response: deleteProductFromShipmentPlanResponse,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const uploadShipmentPlanFiles = async (req, res, next) => {
  upload.array("files")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: "File upload failed",
        err,
      });
    }

    const { email, shipmentPlanId, fileType } = req.body;
    const files = req.files;
    const missingFields = [];

    if (!email) missingFields.push("email");
    if (!shipmentPlanId) missingFields.push("shipmentPlanId");
    if (!files || files.length === 0) missingFields.push("files");
    if (!fileType) missingFields.push("fileType");

    if (fileType !== FileType.FBALabels && fileType !== FileType.OtherFiles) {
      missingFields.push("fileType needs to be fbaLabels or otherFiles");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
      });
    }

    for (const file of files) {
      const { filename, size } = file;

      if (!filename.toLowerCase().endsWith(".pdf") || size > 10 * 1024 * 1024) {
        return res.status(400).json({
          status: "error",
          message: "Invalid file type or size. Only PDF files up to 10 MB are allowed.",
        });
      }
    }

    try {
      const uploadShipmentPlanFileToDBResponse = await ShipmentPlanService.uploadFilesToDB({
        email,
        shipmentPlanId,
        fileType,
        files,
      });

      if (uploadShipmentPlanFileToDBResponse?.status === "error") {
        return res.status(400).json({
          ...uploadShipmentPlanFileToDBResponse,
        });
      }

      res.status(200).json({
        status: "success",
        message: "Success",
        response: uploadShipmentPlanFileToDBResponse,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ status: "error", message: JSON.stringify(e) });
    }
  });
};

const deleteFileFromShipmentPlan = async (req, res) => {
  const { email, shipmentPlanId, fileToDelete, fileType } = req.body;

  const missingFields = [];

  if (!email) missingFields.push("email");
  if (!shipmentPlanId) missingFields.push("shipmentPlanId");
  if (!fileToDelete) missingFields.push("fileToDelete");
  if (!fileType) missingFields.push("fileType");

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  if (fileType !== FileType.FBALabels && fileType !== FileType.OtherFiles) {
    return res.status(400).json({
      status: "error",
      message: "File type must be fbaLabels or otherFiles.",
    });
  }

  try {
    const deleteFileFromSpecificShipmentPlanResponse = await ShipmentPlanService.deleteFileFromShipmentPlan({
      email,
      shipmentPlanId,
      fileToDelete,
      fileType,
    });

    if (deleteFileFromSpecificShipmentPlanResponse?.status === "error") {
      return res.status(400).json({
        ...deleteFileFromSpecificShipmentPlanResponse,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Success",
      response: deleteFileFromSpecificShipmentPlanResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

const updatePaymentStatus = async (req, res) => {
  const { email, shipmentPlanId, paymentStatus } =
    req.body;

  const missingFields = [];

  if (!email) missingFields.push("email");
  if (!shipmentPlanId) missingFields.push("shipmentPlanId");
  if (!paymentStatus) missingFields.push("paymentStatus");


  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  try {
    
    const updateShipmentPlanResponse = await ShipmentPlanService.updateShipmentPlanBasedOnId({
      email,
      shipmentPlanId,
      paymentStatus
    });

    console.log("updateShipmentPlanResponse", updateShipmentPlanResponse);

    if (updateShipmentPlanResponse?.status === "error") {
      return res.status(400).json({
        ...updateShipmentPlanResponse,
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully updated payment status with id ${shipmentPlanId} for user: ${email}`,
      response: updateShipmentPlanResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};

module.exports = {
  add,
  getAll,
  getById,
  deleteShipmentPlan,
  updateShipmentPlan,
  deleteProductFromShipmentPlan,
  uploadShipmentPlanFiles,
  deleteFileFromShipmentPlan,
  updatePaymentStatus
};
