const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recordSchema = new Schema({

    //userEmail: { type: String, required: true },
    //vendorIDs: { type: [String], default: [] },
    //customerNo: { type: [String], default: [] },

    records: [
        {
            order: {
                orderId: { type: String, required: true },
                details: { type: Object, required: true },
            },
            asn: {
                asnId: { type: String, required: true },
                details: { type: Object, required: true },
            },
            customer: {
                customerId: { type: String, required: true },
                details: { type: Object, required: true },
            }
        },
    ],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Middleware to update the updatedAt field on save
recordSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const RecordModel = mongoose.model("Record", recordSchema, "records");

module.exports = RecordModel;