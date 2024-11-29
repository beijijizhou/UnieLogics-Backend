const recordService = require('./records.service');
const ShipmentPlan = require('../shipmentPlan/shipmentPlan.model');

// Controller to add a record
async function addRecord(req, res) {
    const { userEmail, data } = req.body;
    const missingFields = [];

    if (!userEmail) missingFields.push('userEmail');
    if (!data) missingFields.push('data');

    if (missingFields.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: `You have mandatory fields missing: ${missingFields.join(', ')}`,
        });
    }

    try {
        const record = await recordService.addRecord(userEmail, data);
        return res.status(200).json({
            status: 'success',
            message: 'Successfully added record.',
            response: record,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ status: 'error', message: JSON.stringify(e) });
    }
}

// Controller to get all records
async function getAllRecords(req, res) {
    const { userEmail } = req.query;

    if (!userEmail) {
        return res.status(403).json({
            status: 'error',
            message: 'User email is required to retrieve records.',
        });
    }

    try {
        const records = await recordService.getAllRecords(userEmail);
        res.status(200).json({
            status: 'success',
            message: 'Successfully retrieved records.',
            response: records,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ status: 'error', message: JSON.stringify(e) });
    }
}

// Controller to update a record
async function updateRecord(req, res) {
    const { userEmail, recordId, data } = req.body;
    const missingFields = [];

    if (!userEmail) missingFields.push('userEmail');
    if (!recordId) missingFields.push('recordId');
    if (!data) missingFields.push('data');

    if (missingFields.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: `You have mandatory fields missing: ${missingFields.join(', ')}`,
        });
    }

    try {
        const updatedRecord = await recordService.updateRecord(userEmail, recordId, data);
        res.status(200).json({
            status: 'success',
            message: 'Successfully updated record.',
            response: updatedRecord,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ status: 'error', message: JSON.stringify(e) });
    }
}

// Controller to delete a record
async function deleteRecord(req, res) {
    const { userEmail, recordId } = req.body;

    if (!userEmail || !recordId) {
        return res.status(400).json({
            status: 'error',
            message: 'User email and record ID are required to delete a record.',
        });
    }

    try {
        const deleteResponse = await recordService.deleteRecord(userEmail, recordId);
        res.status(200).json({
            status: 'success',
            message: 'Successfully deleted record.',
            response: deleteResponse,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ status: 'error', message: JSON.stringify(e) });
    }
}

// Search info plus API by query
async function searchInfoPlusRecords(req, res) {

    const { searchModule } = req.params;
    const { q } = req.query;

    if (!searchModule) {
        return res.status(403).json({
            status: 'error',
            message: 'API module is required to retrieve records.',
        });
    }

    const response = await recordService.searchInfoPlusApiRecords(searchModule, q);

    res.status(200).json({
        status: 'success',
        message: 'Search by query string',
        response: response,
    });
}

// Search info plus API by filter
async function searchInfoPlusRecordsByFilters(req, res) {

    const { searchModule } = req.params;
    const filterData = req.body;

    if (!searchModule) {
        return res.status(403).json({
            status: 'error',
            message: 'API module is required to retrieve records.',
        });
    }

    const response = await recordService.searchInfoPlusApiRecordsByFilters(searchModule, filterData);

    res.status(200).json({
        status: 'success',
        message: 'Search By Filters',
        response: response,
    });
}


// Create infoplus records
async function createInfoPlusRecords(req, res) {

    // Define the vendor data to send in the request body
    /*const recordData = {
        "vendorNo": 435445,
        "lobId": 22107,
        "name": "Raj new vendor 5",
        "street": "1234 vbn St",
        "city": "Vcvnbr City",
        "state": "VS",
        "zipCode": "12345",
        "inactive": 'Yes'
    };
    const recordModule = 'vendor';*/

    /*const recordData = {
            "lobId": 22107,
            "customerNo": "ASN987",
            "warehouseId": 3105,
            "orderDate": "2024-11-25",
            "carrierId": "111",
            "lineItems": [
               {
                  "sku": "B00006IECI",
                  "orderedQty": 2
               }
            ]  
    };
    const recordModule = 'order';*/


    /*const recordData = {
        "lobId": 22107,
        "poNo": "ASN52864",
        "vendorId": 6,
        "warehouseId": 3105,
        "orderDate": "2024-11-25T00:00:00.000Z",
        "type": "Normal",
        "lineItems":[
            {
                "lobId": 22107,
                "sku": "B00006IECI",
                "orderQuantity":2
            }
        ]
    };
    const recordModule = 'asn';*/
    

    // Define the customer data to send in the request body
    /*const recordData = {
        "lobId": 22107,                 // Line of Business ID
        "customerNo": "ASN987",         // Unique customer number
        "name": "Raju Dev",             // Customer's name
        "street": "1234 Customer St",   // Customer's street address
        "city": "Clifton",              // Customer's city
        "zipCode": "07011",             // Customer's zip code
        "state":"New Jersey",           // Customer's state
        "country": "United States",     // Customer's country
        "packageCarrierId": 111,        // Package carrier ID (e.g., UPS, FedEx) All users will have static data in this field
        "truckCarrierId": 111,          // Truck carrier ID All users will have static data in this field
        "weightBreak": 1,               // Weight break for shipping (e.g., 100 kg) All users will have static data in this field
        "residential": 'No'             // Whether it's a residential address
    };
    const recordModule = 'customer';*/

    // Define the item data to send in the request body
    const recordData = {
        "majorGroupId": 8,                                  // Item Category ID
        "subGroupId": 46,                                   // Item Sub Category ID
        "lobId": 22107,                                     // Line of Business ID
        "sku": "DEMO-12345",                                // SKU (Stock Keeping Unit)
        "itemDescription": "Raju Example Item Description", // Description of the item
        "backorder": "No",                                  // Whether the item is on backorder
        "chargeCode": "Not Chargeable",                     // Charge code for the item
        "maxCycle": 999999,                                 // Maximum cycle for the item
        "maxInterim": 999999,                               // Maximum interim for the item
        "status": "Active",                                 // Status of the item (e.g., active, inactive)
        "seasonalItem": "No",                               // Whether the item is seasonal
        "secure": "No",                                     // Whether the item is secure
        "unitCode": "EACH",                                 // Unit code for the item
        "forwardLotMixingRule": "SKU",                      // Forward lot mixing rule
        "storageLotMixingRule": "SKU",                      // Storage lot mixing rule
        "forwardItemMixingRule": "Multi",                   // Forward item mixing rule
        "storageItemMixingRule": "Multi",                   // Storage item mixing rule
        "allocationRule": "Labor Optimized",                // Allocation rule for the item
        "hazmat": "No",                                     // Whether the item is hazardous material (hazmat)
        "unitsPerWrap": 1,
        "serialCode": "None",                                 
        "wrapCode": "EACH",
        "criticalAmount": 0
    };

    const recordModule = 'item';


    const response = await recordService.createInfoPlusApiRecords(recordModule, recordData);

    res.status(200).json({
        status: 'success',
        message: 'Record successfully created',
        response: response,
    });
}

// Update infoplus records
async function updateInfoPlusRecords(req, res) {

    // Define the vendor data to send in the request body
    const recordData = {
        id: 4,
        vendorNo: 43544,
        lobId: 22107,
        name: "Raju test update",
        street: "1234 Vendor St",
        city: "Vendor City",
        state: "VS",
        zipCode: "12345",
        inactive: 'No'
    };
    const recordModule = 'vendor';

    const response = await recordService.updateInfoPlusApiRecord(recordModule, recordData);

    console.log(response);

    res.status(200).json({
        status: 'success',
        message: 'Record successfully update',
        response: response,
    });
}

// Get infoplus records
async function getInfoPlusRecords(req, res) {

    // Define the vendor data to send in the request body
    const recordId = 3101;
    const recordModule = 'warehouse';

    const response = await recordService.getInfoPlusApiRecord(recordModule, recordId);

    console.log(response);

    res.status(200).json({
        status: 'success',
        message: 'Record successfully fetch',
        response: response,
    });
}

// Delete infoplus records
async function deleteInfoPlusRecords(req, res) {

    // Define the vendor data to send in the request body
    const recordId = 5;
    const recordModule = 'vendor';
    const reqBody = {
        vendorId : 5
    }

    const response = await recordService.deleteInfoPlusApiRecord(recordModule, recordId, reqBody);

    res.status(200).json({
        status: 'success',
        message: 'Record successfully deleted',
        response: response,
    });
}

module.exports = {
    addRecord,
    getAllRecords,
    updateRecord,
    deleteRecord,
    searchInfoPlusRecords,
    searchInfoPlusRecordsByFilters,
    createInfoPlusRecords,
    updateInfoPlusRecords,
    getInfoPlusRecords,
    updateInfoPlusRecords,
    deleteInfoPlusRecords
};