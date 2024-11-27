const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const stateAbbreviations = require("./stateAbrieviation");

const wOwnersSchema = new Schema({
	email: { type: String, required: true },
	warehouses: [
		{
			_id: { type: String, default: null },
			dateAdded: { type: Date, default: null },
			dateModified: { type: Date, default: null },
			name: { type: String, required: true },
			lobId: { type: String, required: true },
			warehouseId: {
				type: String,
				unique: true,
				default: function () {
					const stateName = this.businessAddress?.state;
					const abbreviation =
						stateAbbreviations(stateName);
					const randomDigits = Math.floor(
						100 + Math.random() * 900
					);
					return `${abbreviation}${randomDigits}`;
				},
			},
			vendorId: { type: String, required: true },
			phoneNumber: { type: String, required: true },
			llcName: { type: String, required: true },
			businessName: { type: String, required: true },
			businessAddress: {
				type: Object,
				required: true,
				default: {
					address: "",
					state: "",
					city: "",
					zipCode: "",
					lat: "",
					long: "",
				},
			},
			itemCategories: [
				{
					id: { type: String, required: true },
					internalId: { type: Number, required: false },
					lobId: { type: String, required: true },
					name: { type: String, required: true },
				},
			],
			itemSubCategories: [
				{
					id: { type: String, required: true },
					internalId: { type: Number, required: false },
					lobId: { type: String, required: true },
					name: { type: String, required: true },
				},
			],
			businessPhoneNumber: { type: String, required: true },
			password: { type: String, required: false },
			customerServiceEmailAddress: {
				type: String,
				required: true,
			},
			costPerItemLabeling: { type: String, required: true },
			costPerBoxClosing: { type: String, required: true },
			costPerBox: {
				type: Array,
				required: true,
				default: [
					{
						type: "",
						name: "",
						size: {
							width: "",
							height: "",
							length: "",
						},
						price: "",
					},
				],
			},
			handleShrink: {
				type: Object,
				required: true,
				default: {
					answer: { type: String, required: false },
					small: { price: "" },
					medium: { price: "" },
					large: { price: "" },
				},
			},
			handleHazmat: {
				type: Object,
				required: true,
				default: {
					answer: "",
					pricePerItem: "",
				},
			},
			bubbleWrapping: {
				type: Object,
				required: true,
				default: {
					answer: "",
					pricePerItem: "",
				},
			},
			offerStorage: {
				type: Object,
				required: true,
				default: {
					answer: "",
					pricePerPalet: "",
					pricePerCubicFeet: "",
				},
			},
		},
	],
});

const wOwnersModel = mongoose.model(
	"wOwners",
	wOwnersSchema,
	"wOwners"
);

module.exports = wOwnersModel;
