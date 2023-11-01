const Suppliers = require("./suppliers.model");
const Folders = require("../folders/folders.model");

const SuppliersService = require("./suppliers.service");

module.exports = SuppliersService(Suppliers, Folders);
