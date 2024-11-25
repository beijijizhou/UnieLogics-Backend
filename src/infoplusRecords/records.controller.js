const recordService = require('./records.service');

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

module.exports = {
    addRecord,
    getAllRecords,
    updateRecord,
    deleteRecord,
};