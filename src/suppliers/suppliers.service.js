const { randomUUID } = require("crypto");

const addSuppliersToDB =
  (Suppliers) =>
  async ({ email, supplier }) => {
    new Suppliers({
      email,
      suppliers: [
        {
          _id: randomUUID(),
          ...supplier,
        },
      ],
    }).save();
  };

const updateSuppliersForExistingEmailInDB =
  (Suppliers) =>
  async ({ email, supplier }) => {
    let updateObj = {};
    const currentUserWithSuppliers = await Suppliers.findOne({
      email,
    });

    updateObj = {
      email,
      suppliers: [
        ...currentUserWithSuppliers.suppliers,
        {
          _id: randomUUID(),
          ...supplier,
        },
      ],
    };

    return await Suppliers.findOneAndUpdate({ email }, updateObj);
  };

const getAllSuppliersFromDB =
  (Suppliers) =>
  async ({ email }) => {
    return await Suppliers.findOne({ email });
  };

module.exports = (Suppliers) => {
  return {
    getAllSuppliersFromDB: getAllSuppliersFromDB(Suppliers),
    addSuppliersToDB: addSuppliersToDB(Suppliers),
    updateSuppliersForExistingEmailInDB:
      updateSuppliersForExistingEmailInDB(Suppliers),
  };
};
