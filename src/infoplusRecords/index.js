const records = require("./records.model");
const recordsService = require("./records.service");

module.exports = recordsService(records);