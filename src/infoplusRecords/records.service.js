const RecordModel = require('./records.model');
const axios = require('axios');


// The base URL of the API
const BASE_URL = 'https://infoplus-api-fastapi-es4z.onrender.com';

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

// Function to search records
async function searchInfoPlusApiRecords(searchModule, query) {
    
    try {

        let apiUrl = `${BASE_URL}/${searchModule}/search?`;

        if (query) {
            apiUrl += `query=${query}&`;
        }

      
      apiUrl = apiUrl.endsWith('&') ? apiUrl.slice(0, -1) : apiUrl;
      //console.log(apiUrl);
      // Fetch data from the API using axios
      const response = await axios.get(apiUrl);
  
      // Log the response data
      //console.log('Data:', response.data);
      return response.data;
    } catch (error) {
      // Handle errors,
      //console.error('Error fetching data:', error.message);
      return { error: error.message };
    }
  }

  // Function to search records by Filters
async function searchInfoPlusApiRecordsByFilters(searchModule, filterData) {
    try {

      let apiUrl = `${BASE_URL}/${searchModule}/search`;
      console.log(filterData);

       // Convert filterData object to query string
        const queryParams = new URLSearchParams(filterData).toString();

        // Construct the full URL with the query string
        const fullUrl = `${apiUrl}?${queryParams}`;

        console.log('Request URL:', fullUrl);  // Optional: for debugging purposes

        // Fetch data from the API using axios
        const response = await axios.get(fullUrl, { headers: { 'accept': 'application/json' } });
  
      // Log the response data
      //console.log('Data:', response.data);
      return response.data;
    } catch (error) {
      // Handle errors,
      //console.error('Error fetching data:', error.message);
      return { error: error.message };
    }
  }

  // Function to create a Info Plus Api Records
async function createInfoPlusApiRecords(apiUrl, recordData) {
    try {
        // Ensure the API URL is correct (adjust based on your API structure)
        let url = `${BASE_URL}/${apiUrl}`;

        // Send the POST request with the data in the body
        const response = await axios.post(url, recordData);

        // Log the response data (for debugging purposes)
        // console.log('Record Created:', response.data);

        return response.data; // Return the created data
    } catch (error) {
        // Handle errors
        // console.error('Error creating record:', error.message);
        return { error: error }; // Return the error message
    }
}

// Function to update an existing Info Plus API record
async function updateInfoPlusApiRecord(apiUrl, updatedData) {
    try {
        // Ensure the API URL is correct (adjust based on your API structure)
        let url = `${BASE_URL}/${apiUrl}`;

        // Send the PUT request with the updated data in the body
        const response = await axios.put(url, updatedData);

        // Log the response data (for debugging purposes)
        // console.log('Record Updated:', response.data);

        return response.data; // Return the updated data
    } catch (error) {
        // Handle errors
        // console.error('Error updating record:', error.message);
        return { error: error.message }; // Return the error message
    }
}

// Function to get a specific Info Plus API record
async function getInfoPlusApiRecord(apiUrl, recordId) {
    try {
        // Ensure the API URL is correct (adjust based on your API structure)
        let url = `${BASE_URL}/${apiUrl}/${recordId}`; // Assuming recordId is part of the URL

        // Send the GET request to fetch the specific record
        const response = await axios.get(url);

        // Log the response data (for debugging purposes)
        // console.log('Record Retrieved:', response.data);

        return response.data; // Return the retrieved data
    } catch (error) {
        // Handle errors
        // console.error('Error fetching record:', error.message);
        return { error: error.message }; // Return the error message
    }
}

// Function to delete an Info Plus API record
async function deleteInfoPlusApiRecord(apiUrl, recordId, reqData) {
    try {
        // Ensure the API URL is correct (adjust based on your API structure)
        let url = `${BASE_URL}/${apiUrl}/${recordId}`; // Assuming recordId is part of the URL

        // Send the DELETE request to remove the specific record
        const response = await axios.delete(url, reqData);

        // Log the response data (for debugging purposes)
        // console.log('Record Deleted:', response.data);

        return response.data; // Return the response data (success confirmation)
    } catch (error) {
        // Handle errors
        // console.error('Error deleting record:', error.message);
        return { error: error.message }; // Return the error message
    }
}

module.exports = {
    addRecord,
    getAllRecords,
    updateRecord,
    deleteRecord,
    searchInfoPlusApiRecords,
    searchInfoPlusApiRecordsByFilters,
    createInfoPlusApiRecords,
    updateInfoPlusApiRecord,
    getInfoPlusApiRecord,
    deleteInfoPlusApiRecord
};