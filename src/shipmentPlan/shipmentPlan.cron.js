const cron = require("node-cron");
const recordService = require('../infoplusRecords/records.service');
const shipmentPlanService = require('../shipmentPlan/shipmentPlan.service');

const processInfoplusSyncing = cron.schedule(
	'*/1 * * * *',
	async () => {
		try {
			// Fetch shipment plan from the database
			const existingShipmentPlansResponseArray = await shipmentPlanService.getAllShipmentPlansForCron();

			if (existingShipmentPlansResponseArray && existingShipmentPlansResponseArray.length > 0) {
			// Iterate over each shipment plan
			for (const existingShipmentPlansResponse of existingShipmentPlansResponseArray) {
		
			// Infoplus API integration
			let warehouseId = null;
			let vendorId = null;
			const lineItems = [];
			
			if (!existingShipmentPlansResponse.warehouseOwner) {
				return await shipmentPlanService.updateShipmentPlanBasedOnId({
					email,
					shipmentPlanId: existingShipmentPlansResponse._id,
					status: 'Failed',
					cronResponse: 'Sorry, Warehouse needs to be attached with shipment plan',
				});
			}
		
			// Get warehouseId from Infoplus API
			const warehouseFilters = { filter: `name eq '${existingShipmentPlansResponse.warehouseOwner.name}'` };
			const warehouseData = await recordService.searchInfoPlusApiRecordsByFilters('warehouse', warehouseFilters);
			if (warehouseData && warehouseData.length > 0) {
			  warehouseId = warehouseData[0].id;
			}
		
			// Get vendorId (based on the first product supplier)
			const vendorFilters = { filter: `name eq '${existingShipmentPlansResponse.products[0].supplier.supplierName}'` };
			const vendorData = await recordService.searchInfoPlusApiRecordsByFilters('vendor', vendorFilters);
			if (vendorData && vendorData.length > 0) {
			  vendorId = vendorData[0].id;
			}
		
			// Check if products exist
			if (!existingShipmentPlansResponse.products || existingShipmentPlansResponse.products.length === 0) {

				return await shipmentPlanService.updateShipmentPlanBasedOnId({
					email,
					shipmentPlanId: existingShipmentPlansResponse._id,
					status: 'Failed',
					cronResponse: 'Sorry, Products needs to be attached with shipment plan',
				});
			}
		
			// Loop over products and fetch/create corresponding items
			const productPromises = existingShipmentPlansResponse.products.map(async (product) => {
			  const itemFilters = { filter: `sku eq '${product.fnsku}'` };
			  try {
				const itemData = await recordService.searchInfoPlusApiRecordsByFilters('item', itemFilters);
		
				let orderQuantity = product.boxes * product.unitsPerBox;
		
				if (itemData && itemData.length > 0) {
				  lineItems.push({
					lobId: 22107,
					sku: itemData[0].sku,
					orderQuantity: orderQuantity,
				  });
				} else {
				  // If item doesn't exist, create a new item
				  const hazmat = product.isHazmat ? 'Yes' : 'No';
				  const productData = {
					majorGroupId: 8,
					subGroupId: 46,
					lobId: 22107,
					sku: product.fnsku,
					itemDescription: product.title,
					backorder: 'No',
					chargeCode: 'Not Chargeable',
					maxCycle: 999999,
					maxInterim: 999999,
					status: 'Active',
					seasonalItem: 'No',
					secure: 'No',
					unitCode: 'EACH',
					forwardLotMixingRule: 'SKU',
					storageLotMixingRule: 'SKU',
					forwardItemMixingRule: 'Multi',
					storageItemMixingRule: 'Multi',
					allocationRule: 'Labor Optimized',
					hazmat: hazmat,
					unitsPerWrap: 1,
					serialCode: 'None',
					wrapCode: 'EACH',
					criticalAmount: 0,
				  };
		
				  const newItemData = await recordService.createInfoPlusApiRecords('item', productData);
				  if (newItemData) {
					lineItems.push({
					  lobId: 22107,
					  sku: newItemData.sku,
					  orderQuantity: orderQuantity,
					});
				  }
				}
			  } catch (error) {
				console.error('Error processing product SKU:', product.fnsku, error);
			  }
			});
		
			// Wait for all product promises to finish
			await Promise.all(productPromises);
		
			// Prepare ASN data for Infoplus API
			const asnData = {
			  lobId: 22107,
			  poNo: existingShipmentPlansResponse.orderNo,
			  vendorId,
			  warehouseId,
			  orderDate: existingShipmentPlansResponse.dateAdded,
			  type: "Normal",
			  lineItems,
			};
		
			// Create ASN in Infoplus API
			const infoplusAsn = await recordService.createInfoPlusApiRecords('asn', asnData);
			if (infoplusAsn) {
		
			  return await shipmentPlanService.updateShipmentPlanBasedOnId({
				email,
				shipmentPlanId: existingShipmentPlansResponse._id,
				status: 'Synced',
				cronResponse: 'Done',
			  });

			}
		
			return await shipmentPlanService.updateShipmentPlanBasedOnId({
				email,
				shipmentPlanId: existingShipmentPlansResponse._id,
				status: 'Failed',
				cronResponse: 'Failed to create ASN in Infoplus.',
			});
			}
			}
			
		  } catch (e) {
			console.log(e);
			return await shipmentPlanService.updateShipmentPlanBasedOnId({
				email,
				shipmentPlanId: existingShipmentPlansResponse._id,
				status: 'Failed',
				cronResponse: 'There was an error processing your request.',
			});
		  }
	}
);

module.exports = {
	processInfoplusSyncing,
};
