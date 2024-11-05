const mongoose = require('mongoose');

const userInfoDetailsSchema = new mongoose.Schema({
  vendorId: { type: String, default: null },
  warehouseId: { type: String, default: null },
  records: { type: Array, default: [] }
});

const userInfoDetails = mongoose.model('userInfoDetails', userInfoDetailsSchema);
module.exports = userInfoDetails;