const removeObjectWithId = (arr, id) => {
  const objWithIdIndex = arr.findIndex(
    (obj) => JSON.stringify(obj._id) === JSON.stringify(id)
  );
  if (objWithIdIndex > -1) {
    arr.splice(objWithIdIndex, 1);
    return arr;
  }
  if (objWithIdIndex === -1) {
    return "no_object_with_id";
  }
};

const isUSZipCode = (zipCode) => {
  // Regular expression pattern for U.S. ZIP codes
  var usZipPattern = /^\d{5}(?:-\d{4})?$/;

  return usZipPattern.test(zipCode);
};

exports.removeObjectWithId = removeObjectWithId;
exports.isUSZipCode = isUSZipCode;
