const KeepaService = require("../keepa");
const request = require("request");
const dayjs = require("dayjs");
const keepaKey =
  "doer4spts438qteukukrm0uc6rdg4l873hhj9veb1g4m2856160j8n3gs7edgm89";

const getChartsData = async (req, res) => {
  const { domain, stats, buybox, history, offers, asin } = req.query;

  const chartDataInDb = await KeepaService.getKeepaChartDataFromDatabase({
    asin,
  });
  const differenceBetweenTodayAndChartData = chartDataInDb
    ? dayjs(new Date()).diff(dayjs(chartDataInDb.date), "day")
    : 0;

  if (!chartDataInDb || differenceBetweenTodayAndChartData >= 3) {
    const options = {
      uri: `https://api.keepa.com/product?key=${keepaKey}&domain=${domain}&stats=${stats}&buybox=${buybox}&history=${history}&offers=${offers}&asin=${asin}`,
      gzip: true,
    };
    request(options, async (error, response, body) => {
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
      await KeepaService.saveKeepaChartDataToDatabase({
        keepaProduct: JSON.parse(body),
      });
      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved keepa data",
        ...JSON.parse(body),
      });
    });
  } else {
    return res.status(200).json({
      status: "success",
      message: "Successfully retrieved keepa data",
      ...chartDataInDb._doc,
    });
  }
};

module.exports = {
  getChartsData,
};
