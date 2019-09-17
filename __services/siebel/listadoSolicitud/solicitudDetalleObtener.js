const request = require('request')
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL
const token = require("../token/getToken");
const logger = require('./../../../utils/logger')

const solicitudDetalleObtener = async solicitud => {
  logger.info(`solicitudListadoObtener, ${JSON.stringify(solicitudDetalleObtener)}`)
  const getToken = await token();
  const bodyDataGetDetails = {
    auth: {
      bearer: getToken.access_token
    },
    json: true,
    headers: {
      "Content-Type": "application/json",
      idServicio: "SolicitudDetalleObtener"
    },
    strictSSL: false,
    body: {
      Header: {
        country: "CL",
        commerce: "Falabella",
        channel: "Web"
      },
      Body: {
        SolicitudDetalleObtenerReq: {
          SolicitudDetalleObtener: {
            numeroSolicitudSiebel: solicitud,
            canalOrigen: "Amanda",
            organizacion: "Falabella - Chile"
          }
        }
      }
    }
  };
  try {
    const getDetails = await new Promise((resolve, reject) => {
      request.post(
        `${siebelApiBaseurl}/Service_CallOut`,
        bodyDataGetDetails,
        (err, res, body) => {
          if (err) reject(err);
          resolve(body);
        }
      );
    });
    if (typeof getDetails === "string") {
      return JSON.parse(getDetails);
    }
    return getDetails;
  } catch (error) {
    logger.error(`solicitudListadoObtener, ${JSON.stringify(error)}`)
    return false;
  }
};

module.exports = solicitudDetalleObtener;

