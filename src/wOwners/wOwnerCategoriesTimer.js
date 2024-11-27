const cron = require("node-cron");
const WOwnersService = require(".");
const { getAll } = require("./wOwners.controller");
const {
	fetchAllCategories,
	fetchAllSubCategories,
} = require("./../infoplusRecords/fetchCategories");

const fetchCategories = async () => {
	const categories = await fetchAllCategories();

	const categoriesList = categories.map((item) => ({
		id: item.id,
		internalId: item.internalId,
		lobId: item.lobId.toString(), // Ensure it's a string
		name: item.name,
	}));

	return categoriesList;
};

const warehouseTimer = cron.schedule(
    "*/10 * * * * *",
    async () => {
      try {
        const existingWOwnersResponse = await WOwnersService.getAllWOwnersFromDB();
        const categories = await fetchCategories();
  
        for (const owner of existingWOwnersResponse) {
          const { warehouses, email: wOwnerEmail } = owner;
  
          if (!wOwnerEmail) {
            console.error("Missing email for owner:", owner);
            continue;
          }
  
          for (const warehouse of warehouses) {
            const matchingCategories = categories.filter(
              (category) =>
                category.lobId.toString() === warehouse.lobId.toString()
            );
  
            if (matchingCategories.length > 0) {
              console.log(`Updating warehouse for email ${wOwnerEmail}`);
              console.log(matchingCategories);
  
              await WOwnersService.editWarehousesInDBForExistingOwner({
                wOwner: {
                  ...warehouse,
                  itemCategories: matchingCategories,
                },
                warehouseId: warehouse.warehouseId,
                wOwnerEmail,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error processing warehouses:", error);
      }
    }
  );
  
module.exports = {
	warehouseTimer,
};
