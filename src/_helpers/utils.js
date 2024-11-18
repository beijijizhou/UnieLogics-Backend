const request = require("request");

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

//https://opencagedata.com/ with my gmai login and we have the free plan
const getLatLongFromZipCode = (zipCode) => {
  return new Promise((resolve, reject) => {
    const apiKey = "7284dad5bc0348a2ae43bb69fe33c936";
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${zipCode}&countrycode=US`;

    request.get(apiUrl, { json: true }, (error, response, body) => {
      if (error) {
        reject(error);
        return;
      }

      console.log("OpenCage API response:", body); // Log the entire response

      if (body.results.length > 0) {
        const location = body.results[0].geometry;
        const latitude = location.lat;
        const longitude = location.lng;
        resolve({ latitude, longitude });
      } 
      else {
        reject("Geocoding failed. No results found.");
      }
    });
  });
};

exports.removeObjectWithId = removeObjectWithId;
exports.isUSZipCode = isUSZipCode;
exports.getLatLongFromZipCode = getLatLongFromZipCode;
