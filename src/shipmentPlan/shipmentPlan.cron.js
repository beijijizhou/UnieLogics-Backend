const cron = require("node-cron");
const recordService = require('../infoplusRecords/records.service');
const ShipmentPlanService = require('.');
const shipmentPlanModel = require('./shipmentPlan.model');

const processInfoplusSyncing = cron.schedule(
	'*/1 * * * *',
	async () => {
		try {
			// Fetch shipment plan from the database

			const existingShipmentPlansResponseArray = await shipmentPlanModel.aggregate([
				{
				  $match: {
					"shipmentPlans.status": "Added",  // Filter for shipmentPlans with status 'Added'
				  }
				},
				{ 
				  $unwind: "$shipmentPlans"  // Unwind the shipmentPlans array
				},
				{
				  $match: {
					"shipmentPlans.status": "Added"  // Ensure only 'Added' plans are included
				  }
				},
				{
				  $project: {
					email: 1,  // Include email field
					shipmentPlans: 1  // Include shipmentPlan field
				  }
				}
			  ]);

			  console.log('Started');

			if (existingShipmentPlansResponseArray && existingShipmentPlansResponseArray.length > 0) {
				// Iterate over each shipment plan
				for (const existingShipmentPlansResponse of existingShipmentPlansResponseArray) {
					console.log('Found shipment plans');
					// Infoplus API integration
					let warehouseId = null;
					let vendorId = null;
					let customerNo = null;
					let message = null;
					const lineItems = [];
					const orderLineItems = [];

					const updateShpmentPlan = await ShipmentPlanService.updateShipmentPlanBasedOnId({
						email: existingShipmentPlansResponse.email,
						shipmentPlanId: existingShipmentPlansResponse._id,
						status: 'Syncing',
						cronResponse: 'Shipment plan syncing started.',
					});
					console.log('Shipment status updated');
					
					if (!existingShipmentPlansResponse.warehouseOwner) {
						console.log('Warehouse not attached');
						message += "Sorry, Warehouse needs to be attached with shipment plan"+ "\n";
					}else{
						console.log('Warehouse attached');
						// Get warehouseId from Infoplus API
						const warehouseFilters = { filter: `name eq '${existingShipmentPlansResponse.warehouseOwner.name}'` };
						const warehouseData = await recordService.searchInfoPlusApiRecordsByFilters('warehouse', warehouseFilters);
						if (warehouseData && warehouseData.length > 0) {
							warehouseId = warehouseData[0].id;
						}else{
							message += "Sorry, Warehouse not found on infoplus"+ "\n";
						}
					}

					if (existingShipmentPlansResponse.products && Object.keys(existingShipmentPlansResponse.products[0].supplier).length > 0) {

						console.log('Supplier attached');

						// Get vendorId (based on the first product supplier)
						const vendorFilters = { filter: `name eq '${existingShipmentPlansResponse.products[0].supplier.supplierName}'` };
						const vendorData = await recordService.searchInfoPlusApiRecordsByFilters('vendor', vendorFilters);
						if (vendorData && vendorData.length > 0) {
							vendorId = vendorData[0].id;
						}else{
							message += "Sorry, Vendor not found on infoplus"+ "\n";
						}
					}else{
						console.log('Supplier not attached');
						message += "Sorry, Vendor needs to be attached with shipment plan"+ "\n";
					}

					if (existingShipmentPlansResponse.amazonData && 'customerNumber' in existingShipmentPlansResponse.amazonData && existingShipmentPlansResponse.amazonData.customerNumber !== "") {
						
						console.log('Customer attached');

						// Get customerNumber from Infoplus API
						const customerFilters = { filter: `customerNo eq '${existingShipmentPlansResponse.amazonData.customerNumber}'` };
						const customerData = await recordService.searchInfoPlusApiRecordsByFilters('customer', customerFilters);
						if (customerData && customerData.length > 0) {
							customerNo = customerData[0].customerNo;
						}else{
							const cusNo = (existingShipmentPlansResponse.amazonData.customerNumber)?existingShipmentPlansResponse.amazonData.customerNumber:'CUS53753';
							const custData = {
								"lobId": 22107,                 
								"customerNo": cusNo,        
								"name": "Raju Dev",             
								"street": "1234 Customer St",   
								"city": "Clifton",              
								"zipCode": "07011",             
								"state":"New Jersey",           
								"country": "United States",     
								"packageCarrierId": 111,        // Package carrier ID (e.g., UPS, FedEx) All users will have static data in this field
								"truckCarrierId": 111,          // Truck carrier ID All users will have static data in this field
								"weightBreak": 1,               // Weight break for shipping (e.g., 100 kg) All users will have static data in this field
								"residential": 'No'             
							};

							const newItemData = await recordService.createInfoPlusApiRecords('customer', custData);
							if(newItemData){
								customerNo = cusNo;
							}else{
								message += "Sorry, Unable to create customer"+ "\n";
							}
						}
					}else{
						console.log('Customer not attached');
						message += "Sorry, Customer data needs to be attached with shipment plan"+ "\n";
					}
				
					// Check if products exist
					if (!existingShipmentPlansResponse || !existingShipmentPlansResponse.products || !Array.isArray(existingShipmentPlansResponse.products) || existingShipmentPlansResponse.products.length === 0) {
						console.log('Products not attached');
						message += "Sorry, Products needs to be attached with shipment plan"+ "\n";
					}else{

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

									orderLineItems.push({
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
										orderLineItems.push({
											sku: itemData[0].sku,
											orderQuantity: orderQuantity,
										});

									}else{
										console.log('Unable to create product on infoplus');
										message += "Unable to create product on infoplus"+ "\n";
									}
								}
							} catch (error) {
								console.error('Error processing product SKU:', product.fnsku, error);
								message += "Error processing product SKU"+ "\n";
							}
						});
					
						// Wait for all product promises to finish
						await Promise.all(productPromises);
						console.log('Products attached');

					}
				
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

					// Prepare order data for Infoplus API
					const ordData = {
						lobId: 22107,
						customerNo: customerNo,
						warehouseId,
						orderDate: existingShipmentPlansResponse.dateAdded,
						carrierId: "111",
						lineItems: orderLineItems,
					};
					
					// Create Order in Infoplus API
					const infoplusOrder = await recordService.createInfoPlusApiRecords('order', ordData);

					if(infoplusAsn){
						console.log('ASN not created');
						message += "Error processing ASN"+ "\n";
					}
					if(infoplusOrder){
						console.log('Order not created');
						message += "Error processing Order"+ "\n";
					}

					if (infoplusAsn && infoplusOrder) {
						console.log('Both created');
						await ShipmentPlanService.updateShipmentPlanBasedOnId({
							email: existingShipmentPlansResponse.email,
							shipmentPlanId: existingShipmentPlansResponse._id,
							status: 'Processed',
							cronResponse: 'Succusfully processed.',
						});

					}else{

						await ShipmentPlanService.updateShipmentPlanBasedOnId({
							email: existingShipmentPlansResponse.email,
							shipmentPlanId: existingShipmentPlansResponse._id,
							status: 'Failed',
							cronResponse: message,
						});
						console.log('Both not created');

					}

					console.log('Process next record.');
				}
			}else{
				console.log('No records found!');
			}		
		  } catch (e) {
			console.log(e);
		  }
		  console.log('end');
	}
);

module.exports = {
	processInfoplusSyncing,
};
