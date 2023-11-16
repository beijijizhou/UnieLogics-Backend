const { randomUUID } = require("crypto");
const helpers = require("../_helpers/utils");

const addSuppliersToDB =
  (Suppliers) =>
  async ({ email, supplier }) => {
    try {
      const geoLocationObject = await helpers.getLatLongFromZipCode(
        supplier.supplierAddress.zipCode
      );

      if (
        geoLocationObject.latitude === undefined ||
        geoLocationObject.longitude === undefined
      ) {
        return {
          status: "error",
          message:
            "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
        };
      }
      new Suppliers({
        email,
        suppliers: [
          {
            _id: randomUUID(),
            ...supplier,
            supplierAddress: {
              street: supplier.supplierAddress.street,
              city: supplier.supplierAddress.city,

              state: supplier.supplierAddress.state,
              zipCode: supplier.supplierAddress.zipCode,
              lat: geoLocationObject.latitude.toString(),
              long: geoLocationObject.longitude.toString(),
            },
          },
        ],
      }).save();
    } catch (error) {
      return {
        status: "error",
        message:
          "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
      };
    }
  };

const updateSuppliersForExistingEmailInDB =
  (Suppliers) =>
  async ({ email, supplier }) => {
    try {
      const geoLocationObject = await helpers.getLatLongFromZipCode(
        supplier.supplierAddress.zipCode
      );

      if (
        geoLocationObject.latitude === undefined ||
        geoLocationObject.longitude === undefined
      ) {
        return {
          status: "error",
          message:
            "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
        };
      }
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
            supplierAddress: {
              street: supplier.supplierAddress.street,
              city: supplier.supplierAddress.city,

              state: supplier.supplierAddress.state,
              zipCode: supplier.supplierAddress.zipCode,
              lat: geoLocationObject.latitude.toString(),
              long: geoLocationObject.longitude.toString(),
            },
          },
        ],
      };

      return await Suppliers.findOneAndUpdate({ email }, updateObj);
    } catch (error) {
      return {
        status: "error",
        message:
          "There was an error finding the latitude and longitude for your zipCode. Please contact us if the problem persists.",
      };
    }
  };

const getAllSuppliersFromDB =
  (Suppliers) =>
  async ({ email }) => {
    return await Suppliers.findOne({ email });
  };

const deleteSupplierFromSpecificUser =
  (Suppliers, Folders) =>
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

    // console.log("updateSuppliersWithDeletedOne");
    // console.log(updateSuppliersWithDeletedOne);

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

    const userWithFolderItemsWithSuppliers = await Folders.findOne({ email });

    const updatedFolders = userWithFolderItemsWithSuppliers.folders.map(
      (folder) => {
        folder.folderItems.map((folderItem) => {
          if (JSON.stringify(folderItem.supplier._id) === JSON.stringify(_id)) {
            folderItem.supplier = {
              supplierAddress: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
              },
              contactPerson: {
                name: "",
                email: "",
                phoneNumber: "",
                extensionCode: "",
              },
              _id: "",
              supplierName: "",
              supplierLink: "",
            };
          }
          return folderItem;
        });
        return folder;
      }
    );

    const updatedFolderItemsWithSuppliers = {
      ...userWithFolderItemsWithSuppliers,
      folder: {
        ...updatedFolders,
      },
    };

    // Update the user's folders with the updated folderItems in the database
    await Folders.findOneAndUpdate({ email }, updatedFolderItemsWithSuppliers);

    return await Suppliers.findOne({ email });
  };

module.exports = (Suppliers, Folders) => {
  return {
    getAllSuppliersFromDB: getAllSuppliersFromDB(Suppliers),
    addSuppliersToDB: addSuppliersToDB(Suppliers),
    updateSuppliersForExistingEmailInDB:
      updateSuppliersForExistingEmailInDB(Suppliers),
    deleteSupplierFromSpecificUser: deleteSupplierFromSpecificUser(
      Suppliers,
      Folders
    ),
  };
};
