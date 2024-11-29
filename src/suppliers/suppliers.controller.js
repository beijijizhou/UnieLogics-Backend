const SuppliersService = require(".");
const helpers = require("../_helpers/utils");
const recordService = require('../infoplusRecords/records.service');

const add = async (req, res) => {
  const { email, supplier } = req.body;
  const missingFields = [];
  let supplierToBeSentToDB = supplier;

  if (!email) missingFields.push("email");
  if (!supplier) missingFields.push("supplier");
  if (!supplier?.supplierName) missingFields.push("supplierName");
  if (!supplier?.supplierLink) missingFields.push("supplierLink");
  if (!supplier?.onlineSupplier) missingFields.push("onlineSupplier");
  if (supplier?.onlineSupplier?.toLowerCase() !== "yes") {
    if (!supplier?.supplierAddress) missingFields.push("supplierAddress");
    if (!supplier?.supplierAddress.street)
      missingFields.push("supplierAddress.street");
    if (!supplier?.supplierAddress.city)
      missingFields.push("supplierAddress.city");
    if (!supplier?.supplierAddress.state)
      missingFields.push("supplierAddress.state");
    if (!supplier?.supplierAddress.zipCode)
      missingFields.push("supplierAddress.zipCode");
    if (supplier?.supplierAddress) {
      if (!supplier?.supplierAddress.zipCode) {
        missingFields.push("supplierAddress.zipCode");
      } else {
        // Add a rule to check if the ZIP code is from the U.S.
        if (!helpers.isUSZipCode(supplier.supplierAddress.zipCode)) {
          return res.status(400).json({
            status: "error",
            message: "ZIP code needs to be from the U.S.",
          });
        }
      }
    }
    if (!supplier?.contactPerson) missingFields.push("contactPerson");
    if (!supplier?.contactPerson.name) missingFields.push("contactPerson.name");
    if (!supplier?.contactPerson.email)
      missingFields.push("contactPerson.email");
    if (!supplier?.contactPerson.phoneNumber)
      missingFields.push("contactPerson.phoneNumber");
    if (!supplier?.contactPerson.extensionCode)
      missingFields.push("contactPerson.extensionCode");
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `You have mandatory fields missing: ${missingFields.join(", ")}`,
    });
  }

  if (supplier?.onlineSupplier?.toLowerCase() === "yes") {
    supplierToBeSentToDB = {
      ...supplier,
      onlineSupplier: "yes",
      supplierAddress: {
        street: "823 Westfield Ave",
        city: "Elizabeth",
        state: "NJ",
        zipCode: "07208",
      },
      contactPerson: {
        name: "Online Supplier",
        email: "-",
        phoneNumber: "-",
        extensionCode: "-",
      },
    };
  }

  // Infoplus API code start 
  const recordModule = 'vendor';
  const filters = {
    "filter":"name eq '" + supplierToBeSentToDB.supplierName + "'"
  };

  const responseData = await recordService.searchInfoPlusApiRecordsByFilters(recordModule, filters);
    if(!responseData){

    // Define the vendor data to send in the request body
      const recordData = {
          "vendorNo": 43544,
          "lobId": 22107,
          "name": supplierToBeSentToDB.supplierName,
          "street": supplierToBeSentToDB.supplierAddress.street,
          "city": supplierToBeSentToDB.supplierAddress.city,
          "state": supplierToBeSentToDB.supplierAddress.state,
          "zipCode": supplierToBeSentToDB.supplierAddress.zipCode,
          "contact": supplierToBeSentToDB.contactPerson.name,
          "phone": supplierToBeSentToDB.contactPerson.phoneNumber,
          "inactive": 'Yes'
      };
      
      const apiResponse = await recordService.createInfoPlusApiRecords(recordModule, recordData);
      if(apiResponse){
        recordData.id = apiResponse.response.id;
        const updateVendor = await recordService.updateInfoPlusApiRecord(recordModule, recordData);
        const infoplusvendorid = updateVendor.response.id;
        supplierToBeSentToDB.infoPlusId=infoplusvendorid;
      }     
    }else{
      const infoplusvendorid = responseData[0].id;
      supplierToBeSentToDB.infoPlusId=infoplusvendorid;
    }
    // Infoplus API code end 

  try {
    const existingSuppliersForEmail =
      await SuppliersService.getAllSuppliersFromDB({
        email,
      });
      
    if (existingSuppliersForEmail) {

      const updateSuppliersExistingOwnerResponse =
        await SuppliersService.updateSuppliersForExistingEmailInDB({
          email,
          supplier: supplierToBeSentToDB,
        });

      if (updateSuppliersExistingOwnerResponse?.status === "error") {
        return res.status(400).json({
          ...updateSuppliersExistingOwnerResponse,
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Successfully updated Supplier for existing Suppliers.`,
      });

    } else {

      const addSupplierResponse = await SuppliersService.addSuppliersToDB({
        email,
        supplier: supplierToBeSentToDB,
      });

      if (addSupplierResponse?.status === "error") {
        return res.status(400).json({
          ...addSupplierResponse,
        });
      }

      return res.status(200).json({
        status: "success",
        message: `Successfully added Supplier to the database!`,
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
      message: "Sorry, there was an error retriving your suppliers.",
    });
  }
  try {
    const existingSuppliersResponse =
      await SuppliersService.getAllSuppliersFromDB({ email });

    res.status(200).json({
      status: "success",
      message: "Successfully retrieved your Suppliers",
      response: !existingSuppliersResponse ? [] : existingSuppliersResponse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: "error",
      message: "There was an error processing your request.",
    });
  }
};

const deleteSupplier = async (req, res) => {
  const { email, _id } = req.body;

  if (!_id || !email) {
    console.log(
      "No ID or EMAIL has been provided, so we don't know which supplier to delete!"
    );

    return res.status(400).json({
      status: "errror",
      message:
        "No ID or EMAIL has been provided, so we don't know which supplier to delete!",
    });
  }

  try {
    const deleteSupplierResponse =
      await SuppliersService.deleteSupplierFromSpecificUser({
        email: email.toLowerCase(),
        _id,
      });

    if (deleteSupplierResponse?.status === "error") {
      console.log(deleteSupplierResponse);
      return res.status(400).json({
        ...deleteSupplierResponse,
      });
    } else {
      // console.log(deleteSupplierResponse);

      return res.status(200).json({
        status: "success",
        message: `Successfully deleted supplier with id ${_id}`,
        response: deleteSupplierResponse,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", message: JSON.stringify(e) });
  }
};
module.exports = {
  add,
  getAll,
  deleteSupplier,
};
