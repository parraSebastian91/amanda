const token = require("../token/getToken");
const logger = require('./../../../utils/logger')
const formatRut = require("../formats/rutFormater");
const request = require("request");
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL;

const getClientInfo = async rut => {
  const getToken = await token();
  const rutFormat = await formatRut(rut);

  const bodyDataClientInfo = {
    auth: {
      bearer: getToken.access_token
    },
    json: true,
    headers: {
      "Content-Type": "application/json",
      idServicio: "ClienteDatosConsultarV1.1"
    },
    strictSSL: false,
    body: {
      Header: {
        country: "CL",
        commerce: "Falabella",
        channel: "Web"
      },
      Body: {
        ListOfFalContactRequestIo: {
          FALContactEAI: {
            organizacion: "Falabella - Chile",
            tipoIdentificacion: "RUT",
            numeroIdentificacion: rutFormat[0],
            digitoValidador: rutFormat[1]
          }
        }
      }
    }
  };

  const infoClient = await new Promise((resolve, reject) => {
    request.post(
      `${siebelApiBaseurl}/Service_CallOut`,
      bodyDataClientInfo,
      (err, res, body) => {
        if (err) reject(err);
        resolve(body);
      }
    );
  });
  logger.info(`infoClient, ${JSON.stringify(infoClient)}`)
  return infoClient;
};

module.exports = getClientInfo;
