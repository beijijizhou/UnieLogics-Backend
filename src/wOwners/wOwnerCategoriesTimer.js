const cron = require("node-cron");
const { getAll } = require("./wOwners.controller");
const WOwnersService = require(".");

const warehouseTimer = cron.schedule(
	"*/30 * * * * *",
	async () => {
		try {
			const existingWOwnersResponse =
				await WOwnersService.getAllWOwnersFromDB();

			existingWOwnersResponse.forEach((owner) => {
				const { warehouses, lobId } = owner;
				console.log(warehouses);
				// Check if lobId matches the condition
				// if (lobId === incomingLobId) {
				// 	// Replace 'incomingLobId' with your actual value
				// 	warehouses.forEach((warehouse, index) => {
				// 		// console.log(`Warehouse ${index + 1}:`, warehouse);

				// 		// Update warehouse logic here
				// 		updateWarehousesInDBForExistingOwner(
				// 			owner._id,
				// 			warehouse
				// 		);
				// 	});
				// }
			});

			// console.log(existingWOwnersResponse.email);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}
);

module.exports = {
	warehouseTimer,
};
