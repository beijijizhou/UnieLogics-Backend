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

exports.removeObjectWithId = removeObjectWithId;
