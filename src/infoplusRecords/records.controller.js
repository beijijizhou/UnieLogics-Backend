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
    const recordData = {
        vendorNo: 43544,
        lobId: 22107,
        name: "Raj new vendor",
        street: "1234 vbn St",
        city: "Vcvnbr City",
        state: "VS",
        zipCode: "12345",
        inactive: 'Yes'
    };
    const recordModule = 'vendor';
    

    // Define the customer data to send in the request body
    /*const recordData = {
        lobId: 22107,                  // Line of Business ID
        customerNo: "CUST12345",           // Unique customer number
        name: "Raju Dev",                  // Customer's name
        street: "1234 Customer St",        // Customer's street address
        city: "Customer City",             // Customer's city
        zipCode: "54321",                  // Customer's zip code
        country: "US",                     // Customer's country
        packageCarrierId: 10000,        // Package carrier ID (e.g., UPS, FedEx)
        truckCarrierId: 2100,          // Truck carrier ID
        weightBreak: 100,                  // Weight break for shipping (e.g., 100 kg)
        residential: 'No'                  // Whether it's a residential address
    };
    const recordModule = 'customer';*/

    // Define the warehouse data to send in the request body
    /*const recordData = {
        client: "CLIENT001",                               // Client ID
        name: "Main Warehouse",                            // Name of the warehouse
        company: "Warehouse Co.",                          // Company name
        street1: "1234 Warehouse Blvd",                    // Street address
        city: "Warehouse City",                            // City
        zip: "98765",                                      // Zip code
        country: "US",                                     // Country
        phone: "+1234567890",                              // Phone number
        packStationAllowPackingBeforePickWorkIsComplete: true,  // Allow packing before picking is complete
        packStationSkipCartonLPN: false,                   // Skip carton LPN
        packStationRequireConfirmOnError: true,            // Require confirmation on error
        packStationAllowScanningSKUToIdentifyOrders: true, // Allow SKU scanning to identify orders
        packStationAllowEntryOfItemQuantities: true,       // Allow entry of item quantities
        shipStationWeightCheckPackedOrders: true,          // Weight check on packed orders
        shipStationShowUserWeightCheckExceptions: false,   // Show weight check exceptions
        shipStationAutoPrintPreGeneratedLabels: true,      // Auto print pre-generated labels
        shipStationAllowScanningSKUToIdentifyOrders: true, // Allow SKU scanning to identify orders
        shipStationAllowRateShopping: false                // Allow rate shopping
    };

    const recordModule = 'warehouse';*/

    // Define the item data to send in the request body
    /*const recordData = {
        majorGroupId: 1,                        // Major group ID
        subGroupId: 46,                            // Subgroup ID
        lobId: 22107,                                 // Line of Business ID
        sku: "ITEM12345",                                // SKU (Stock Keeping Unit)
        itemDescription: "Raju Example Item Description",     // Description of the item
        backorder: 'No',                                // Whether the item is on backorder
        chargeCode: "CHARGE123",                         // Charge code for the item
        maxCycle: 100,                                   // Maximum cycle for the item
        maxInterim: 50,                                  // Maximum interim for the item
        status: "Active",                                // Status of the item (e.g., active, inactive)
        seasonalItem: 'No',                             // Whether the item is seasonal
        secure: 'No',                                    // Whether the item is secure
        unitCode: "UNIT001",                             // Unit code for the item
        forwardLotMixingRule: "RULE1",                   // Forward lot mixing rule
        storageLotMixingRule: "RULE2",                   // Storage lot mixing rule
        forwardItemMixingRule: "ITEMRULE1",              // Forward item mixing rule
        storageItemMixingRule: "ITEMRULE2",              // Storage item mixing rule
        allocationRule: "ALLOCATIONRULE1",               // Allocation rule for the item
        receivingCriteriaSchemeId: 1,            // Receiving criteria scheme ID
        hazmat: 'No'                                    // Whether the item is hazardous material (hazmat)
    };

    const recordModule = 'item';*/


    const response = await recordService.createInfoPlusApiRecords(recordModule, recordData);

    console.log(response);

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
    const recordId = 4;
    const recordModule = 'vendor';

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