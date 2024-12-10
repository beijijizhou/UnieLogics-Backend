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
					let customerId = null;
					let customerNo = null;
					let asnId = null;
					let orderId = null;
					let message = '';
					let lobId = null;
					const lineItems = [];
					const orderLineItems = [];

					//Set shipment plan status as syncing
					const updateShpmentPlan = await ShipmentPlanService.updateShipmentPlanBasedOnId({
						email: existingShipmentPlansResponse.email,
						shipmentPlanId: existingShipmentPlansResponse.shipmentPlans._id,
						status: "In progress",
						cronResponse: "Shipment plan syncing started.",
					});
					console.log('Shipment status updated');

					if (existingShipmentPlansResponse.shipmentPlans.warehouseOwner && Object.keys(existingShipmentPlansResponse.shipmentPlans.warehouseOwner).length > 0) {
						
						console.log('Warehouse attached');
						lobId = existingShipmentPlansResponse.shipmentPlans.warehouseOwner.lobId;
						// Get warehouseId from Infoplus API
						const warehouseFilters = { filter: `id eq '${existingShipmentPlansResponse.shipmentPlans.warehouseOwner.warehouseId}'` };
						const warehouseData = await recordService.searchInfoPlusApiRecordsByFilters('warehouse', warehouseFilters);
						if (warehouseData && warehouseData.length > 0) {
							warehouseId = warehouseData[0].id;
						}else{
							message += "Warehouse not found on infoplus"+ "\n";
						}

					}else{

						console.log('Warehouse not attached');
						message += "Warehouse needs to be attached with shipment plan"+ "\n";
						
					}

					if (existingShipmentPlansResponse.shipmentPlans.products && Object.keys(existingShipmentPlansResponse.shipmentPlans.products[0].supplier).length > 0) {

						console.log('Supplier attached');

						// Get vendorId (based on the first product supplier)
						const vendorFilters = { filter: `name eq '${existingShipmentPlansResponse.shipmentPlans.products[0].supplier.supplierName}'` };
						const vendorData = await recordService.searchInfoPlusApiRecordsByFilters('vendor', vendorFilters);
						
						if (vendorData && vendorData.length > 0) {
							vendorId = vendorData[0].id;
						}else{

							//Create vendor
							// Define the vendor data to send in the request body
							const vendorRecord = {
								"vendorNo": 64353322,
								"lobId": lobId,
								"name": existingShipmentPlansResponse.shipmentPlans.products[0].supplier.supplierName,
								"street": existingShipmentPlansResponse.shipmentPlans.products[0].supplier.supplierAddress.street,
								"city": existingShipmentPlansResponse.shipmentPlans.products[0].supplier.supplierAddress.city,
								"state": existingShipmentPlansResponse.shipmentPlans.products[0].supplier.supplierAddress.state,
								"zipCode": existingShipmentPlansResponse.shipmentPlans.products[0].supplier.supplierAddress.zipCode,
								"contact": existingShipmentPlansResponse.shipmentPlans.products[0].supplier.contactPerson.name,
								"phone": existingShipmentPlansResponse.shipmentPlans.products[0].supplier.contactPerson.phoneNumber,
								"inactive": "No"
							};
							//Create vendor on infoplus API
							const newVendorData = await recordService.createInfoPlusApiRecords('vendor', vendorRecord);
							if(newVendorData){
								vendorId = newVendorData.id;
							}else{
								message += "Unable to create vendor"+ "\n";
							}
								message += "Vendor not found on infoplus"+ "\n";
						}
					}else{
						console.log('Supplier not attached');
						message += "Vendor needs to be attached with shipment plan"+ "\n";
					}

					if (existingShipmentPlansResponse.shipmentPlans.amazonData && 'customerNumber' in existingShipmentPlansResponse.shipmentPlans.amazonData && existingShipmentPlansResponse.shipmentPlans.amazonData.customerNumber !== "") {
						
						console.log('Customer attached');

						// Get customerNumber from Infoplus API
						const customerFilters = { filter: `customerNo eq '${existingShipmentPlansResponse.shipmentPlans.amazonData.customerNumber}'` };
						const customerData = await recordService.searchInfoPlusApiRecordsByFilters('customer', customerFilters);
						if (customerData && customerData.length > 0) {
							customerNo = customerData[0].customerNo;
							customerId = customerData[0].id;
						}else{

							//Prepare customer data
							const cusNo = (existingShipmentPlansResponse.shipmentPlans.amazonData.customerNumber)?existingShipmentPlansResponse.shipmentPlans.amazonData.customerNumber:'CUS537543';
							const custData = {
								"lobId": lobId,                 
								"customerNo": cusNo,        
								"name": "Raju Dev New",             
								"street": "1234 Customer St",   
								"city": "Clifton",              
								"zipCode": "07011",             
								"state":"New Jersey",           
								"country": "United States",     
								"packageCarrierId": 111,        // Package carrier ID (e.g., UPS, FedEx) All users will have static data in this field
								"truckCarrierId": 111,          // Truck carrier ID All users will have static data in this field
								"weightBreak": 1,               // Weight break for shipping (e.g., 100 kg) All users will have static data in this field
								"residential": "No"             
							};
							//Creating customer on infoplus API
							const newItemData = await recordService.createInfoPlusApiRecords('customer', custData);
							if(newItemData){
								customerNo = cusNo;
								customerId = newItemData.id;
							}else{
								message += "Unable to create customer"+ "\n";
							}
						}
					}else{
						console.log('Customer not attached');
						message += "Customer data needs to be attached with shipment plan"+ "\n";
					}

					//Checking vendorId, warehouseId, lobId and customerId validations
					if(!vendorId || !warehouseId || !lobId || !customerNo || !customerId){

						message += 'Required Fields Status: vendorId:'+vendorId+'-warehouseId:'+warehouseId+'-lobId:'+lobId+'-customerNo:'+customerNo+'-customerId:'+customerId;

						await ShipmentPlanService.updateShipmentPlanBasedOnId({
							email: existingShipmentPlansResponse.email,
							shipmentPlanId: existingShipmentPlansResponse.shipmentPlans._id,
							status: "Failed",
							cronResponse: message,
						});
						console.log('Required field condition did not match.');
						continue;
					}

				
					// Check if products exist
					if (!existingShipmentPlansResponse.shipmentPlans || !existingShipmentPlansResponse.shipmentPlans.products || !Array.isArray(existingShipmentPlansResponse.shipmentPlans.products) || existingShipmentPlansResponse.shipmentPlans.products.length === 0) {
						console.log('Products not attached');
						message += "Products needs to be attached with shipment plan"+ "\n";
					}else{

						// Loop over products and fetch/create corresponding items
						const productPromises = existingShipmentPlansResponse.shipmentPlans.products.map(async (product) => {
							const itemFilters = { filter: `sku eq '${product.fnsku}'` };
							try {
								const itemData = await recordService.searchInfoPlusApiRecordsByFilters('item', itemFilters);
						
								let orderQuantity = product.boxes * product.unitsPerBox;
						
								if (itemData && itemData.length > 0) {
									lineItems.push({
										lobId: lobId,
										sku: product.fnsku,
										orderQuantity: orderQuantity,
									});

									orderLineItems.push({
										sku: product.fnsku,
										orderedQty: orderQuantity,
									});
								} else {
									// If item doesn't exist, create a new item
									const hazmat = product.isHazmat ? 'Yes' : 'No';
									const productData = {
										majorGroupId: 8,
										subGroupId: 46,
										lobId: lobId,
										sku: product.fnsku,
										itemDescription: product.title,
										backorder: "No",
										chargeCode: "Not Chargeable",
										maxCycle: 999999,
										maxInterim: 999999,
										status: "Active",
										seasonalItem: "No",
										secure: "No",
										unitCode: "EACH",
										forwardLotMixingRule: "SKU",
										storageLotMixingRule: "SKU",
										forwardItemMixingRule: "Multi",
										storageItemMixingRule: "Multi",
										allocationRule: "Labor Optimized",
										hazmat: hazmat,
										unitsPerWrap: 1,
										serialCode: "None",
										wrapCode: "EACH",
										criticalAmount: 0,
									};
									// Create item in Infoplus API
									const newItemData = await recordService.createInfoPlusApiRecords('item', productData);
									if (newItemData) {
										lineItems.push({
											lobId: lobId,
											sku: newItemData.sku,
											orderQuantity: orderQuantity,
										});
										orderLineItems.push({
											sku: newItemData.sku,
											orderedQty: orderQuantity,
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
					//Checking for lineItems and orderLineItems condition
					if(lineItems.length === 0 || orderLineItems.length === 0){
						await ShipmentPlanService.updateShipmentPlanBasedOnId({
							email: existingShipmentPlansResponse.email,
							shipmentPlanId: existingShipmentPlansResponse.shipmentPlans._id,
							status: "Failed",
							cronResponse: message,
						});
						console.log('Line items is empty.');
						continue;
					}
				
					// Prepare ASN data for Infoplus API
					const asnData = {
						lobId: lobId,
						poNo: existingShipmentPlansResponse.shipmentPlans.orderNo,
						vendorId,
						warehouseId,
						orderDate: existingShipmentPlansResponse.shipmentPlans.dateAdded,
						type: "Normal",
						lineItems,
					};
				
					// Create ASN in Infoplus API
					const infoplusAsn = await recordService.createInfoPlusApiRecords('asn', asnData);

					// Prepare order data for Infoplus API
					const ordData = {
						lobId: lobId,
						customerNo: customerNo,
						warehouseId,
						orderDate: existingShipmentPlansResponse.shipmentPlans.dateAdded,
						carrierId: "111",
						lineItems: orderLineItems,
					};
					
					// Create Order in Infoplus API
					const infoplusOrder = await recordService.createInfoPlusApiRecords('order', ordData);

					//Checking ASN creation status to log message
					if(!infoplusAsn){
						console.log('ASN not created');
						message += "Error processing ASN"+ "\n";
					}

					//Checking order creation status to log message
					if(!infoplusOrder){
						console.log('Order not created');
						message += "Error processing Order"+ "\n";
					}

					//Checking ASN and Order status
					if (infoplusAsn && infoplusOrder) {
						console.log('ASN and order created');

						asnId=infoplusAsn.id;
						orderId=infoplusOrder.id;
						//Update shipment plan status after process completed
						await ShipmentPlanService.updateShipmentPlanBasedOnId({
							email: existingShipmentPlansResponse.email,
							shipmentPlanId: existingShipmentPlansResponse.shipmentPlans._id,
							status: "Shipped",
							infoPlusVendorId: vendorId,
							infoPlusCustomerId: customerId,
							infoPlusAsnId: asnId,
							infoPlusOrderId: orderId,
							cronResponse: "Succusfully processed.",
						});

					}else{
						//Update shipment plan status after process failed
						await ShipmentPlanService.updateShipmentPlanBasedOnId({
							email: existingShipmentPlansResponse.email,
							shipmentPlanId: existingShipmentPlansResponse.shipmentPlans._id,
							status: "Failed",
							cronResponse: message,
						});
						console.log('ASN and Order not created');

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
