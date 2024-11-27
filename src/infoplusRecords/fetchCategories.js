const axios = require("axios");
 
const INFOPLUS_API_KEY =
    "1920DB4EFEEBD7FBA852392DB8A691D36167AF072E4DD1D241E6867A9F21DD6D";
const INFOPLUS_DOMAIN =
    "https://unielogics-test.infopluswms.com/infoplus-wms";
 
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
 