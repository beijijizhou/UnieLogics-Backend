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

const fetchSubCategories = async () => {
	const categories = await fetchAllSubCategories();

	const categoriesList = categories.map((item) => ({
		id: item.id,
		internalId: item.internalId,
		lobId: item.lobId.toString(), // Ensure it's a string
		name: item.name,
	}));

	return categoriesList;
};

const warehouseTimer = cron.schedule(
	process.env.WAREHOUSE_CRON_EXPRESSION_TIMER,
	async () => {
		try {
			const existingWOwnersResponse =
				await WOwnersService.getAllWOwnersFromDB();
			const categories = await fetchCategories();
			const subCategories = await fetchSubCategories();

			for (const owner of existingWOwnersResponse) {
				const { warehouses, email: wOwnerEmail } = owner;

				if (!wOwnerEmail) {
					console.error("Missing email for owner:", owner);
					continue;
				}

				for (const warehouse of warehouses) {
					const matchingCategories = categories.filter(
						(category) =>
							category.lobId.toString() ===
							warehouse.lobId.toString()
					);
					const matchingSubCategories =
						subCategories.filter(
							(subCategory) =>
								subCategory.lobId.toString() ===
								warehouse.lobId.toString()
						);

					if (
						matchingCategories.length > 0 ||
						matchingSubCategories.length > 0
					) {
						warehouse.itemCategories = matchingCategories;
						warehouse.itemSubCategories =
							matchingSubCategories;

						await WOwnersService.editWarehousesInDBForExistingOwner(
							{
								wOwner: warehouse,
								warehouseId: warehouse.warehouseId,
								wOwnerEmail,
							}
						);
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
