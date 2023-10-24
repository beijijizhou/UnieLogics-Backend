const { randomUUID } = require("crypto");
const helpers = require("../_helpers/utils");

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

const deleteSupplierFromSpecificUser =
  (Suppliers) =>
  async ({ email, _id }) => {
    console.log(email, _id);
    const userWithSuppliers = await Suppliers.findOne({ email });

    if (!userWithSuppliers) {
      return {
        status: "error",
        message:
          "The email and _id provided are not matching with a user with suppliers!",
      };
    }

    const updateSuppliersWithDeletedOne = helpers.removeObjectWithId(
      userWithSuppliers.suppliers,
      _id
    );

    console.log("updateSuppliersWithDeletedOne");
    console.log(updateSuppliersWithDeletedOne);

    if (updateSuppliersWithDeletedOne === "no_object_with_id") {
      return {
        status: "error",
        message: "There is no supplier with this id for this user.",
      };
    }
    const updateObj = {
      ...userWithSuppliers,
      suppliers: {
        ...updateSuppliersWithDeletedOne,
      },
    };

    await Suppliers.findOneAndUpdate({ email }, updateObj);

    return await Suppliers.findOne({ email });
  };

module.exports = (Suppliers) => {
  return {
    getAllSuppliersFromDB: getAllSuppliersFromDB(Suppliers),
    addSuppliersToDB: addSuppliersToDB(Suppliers),
    updateSuppliersForExistingEmailInDB:
      updateSuppliersForExistingEmailInDB(Suppliers),
    deleteSupplierFromSpecificUser: deleteSupplierFromSpecificUser(Suppliers),
  };
};
