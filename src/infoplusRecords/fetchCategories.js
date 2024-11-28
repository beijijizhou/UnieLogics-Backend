const axios = require("axios");
 
const INFOPLUS_API_KEY = process.env.INFOPLUS_API_KEY;
const INFOPLUS_DOMAIN = process.env.INFOPLUS_DOMAIN;
 
const fetchFromInfoplus = async (endpoint) => {
    try {
        const response = await axios.get(
            `${INFOPLUS_DOMAIN}/api/v2.0/${endpoint}`,
            {
                headers: {
                    "Content-type": "application/json",
                    "API-Key": `${INFOPLUS_API_KEY}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(
            "Error fetching from Infoplus:",
            error.message
        );
        return null;
    }
};
 
const fetchAllSubCategories = async () => {
    return fetchFromInfoplus("itemSubCategory/search")
};
 
const fetchAllCategories = () => {
    return fetchFromInfoplus("itemCategory/search")
};
 
module.exports = {
    fetchAllCategories,
    fetchAllSubCategories,
};
 