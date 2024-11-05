const mongoose = require('mongoose');

const userInfoDetailsSchema = new mongoose.Schema({
  vendorId: { type: [String], default: [] },
  warehouseId: { type: [String], default: [] },
  records: { type: Array, default: [] }
});

const userInfoDetails = mongoose.model('userInfoDetails', userInfoDetailsSchema);
module.exports = userInfoDetails;