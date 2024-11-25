const RecordModel = require('./records.model');

// Function to add a record
async function addRecord(userEmail, data) {
    try {
        const newRecord = new RecordModel({ userEmail, ...data });
        return await newRecord.save();
    } catch (error) {
        throw new Error('Error adding record: ' + error.message);
    }
}

// Function to get all records for a user
async function getAllRecords(userEmail) {
    try {
        return await RecordModel.find({ userEmail });
    } catch (error) {
        throw new Error('Error retrieving records: ' + error.message);
    }
}

// Function to update a record
async function updateRecord(userEmail, recordId, data) {
    try {
        const updatedRecord = await RecordModel.findOneAndUpdate(
            { _id: recordId, userEmail },
            data,
            { new: true }
        );
        if (!updatedRecord) {
            throw new Error('Record not found');
        }
        return updatedRecord;
    } catch (error) {
        throw new Error('Error updating record: ' + error.message);
    }
}

// Function to delete a record
async function deleteRecord(userEmail, recordId) {
    try {
        const deleteResponse = await RecordModel.findOneAndDelete({ _id: recordId, userEmail });
        if (!deleteResponse) {
            throw new Error('Record not found');
        }
        return deleteResponse;
    } catch (error) {
        throw new Error('Error deleting record: ' + error.message);
    }
}

module.exports = {
    addRecord,
    getAllRecords,
    updateRecord,
    deleteRecord,
};