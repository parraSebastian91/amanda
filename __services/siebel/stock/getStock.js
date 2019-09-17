const request = require("request");
const logger = require('./../../../utils/logger');
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL;
const token = require("../token/getToken");

const getStock = async info => {
  const getToken = await token();
  const GS = {
    auth: {
      bearer: getToken.access_token
    },
    json: true,
    headers: {
      idServicio: "GetStock"
    },
    body: {
      Header: {
        country: "CL",
        commerce: "Falabella",
        channel: "Web"
      },
      Body: {
        SKU: info.sku,
        sistemaResolutor: "SRX",
        negocio: "Falabella",
        fuente: info.fuente
      }
    },
    strictSSL: false
  };
  try {
    const getStock = await new Promise((resolve, reject) => {
      request.post(
        `${siebelApiBaseurl}/ServiceCallOut`,
        GS,
        (err, res, body) => {
          if (err) reject(err);
          resolve(body);
        }
      );
    });
    logger.info(`getStock, ${JSON.stringify(getStock)}`)
    return (
      parseFloat(getStock.response.Body.ConsultaStockResponse.stockTotal, 10) >
      10
    );
  } catch (error) {
    logger.error(`getStock, ${JSON.stringify(error)}`)
    return false;
  }
};

module.exports = getStock

