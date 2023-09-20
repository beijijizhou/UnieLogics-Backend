const request = require("request");
const keepaKey =
  "doer4spts438qteukukrm0uc6rdg4l873hhj9veb1g4m2856160j8n3gs7edgm89";

const getChartsData = async (req, res) => {
  const { domain, stats, buybox, history, offers, asin } = req.query;

  const options = {
    uri: `https://api.keepa.com/product?key=${keepaKey}&domain=${domain}&stats=${stats}&buybox=${buybox}&history=${history}&offers=${offers}&asin=${asin}`,
    gzip: true,
  };
  request(options, function (error, response, body) {
    if (error) {
      rest.status(500).json({
        status: "error",
        message: error,
        ...response,
      });
    }
    console.log(
      "Request Url is ",
      `https://api.keepa.com/product?key=${keepaKey}&domain=${domain}&stats=${stats}&buybox=${buybox}&history=${history}&offers=${offers}&asin=${asin}`
    );
    console.log(JSON.parse(body));
    return res.status(200).json({
      status: "success",
      message: "Successfully retrieved keepa data",
      ...JSON.parse(body),
    });
  });
};

module.exports = {
  getChartsData,
};
