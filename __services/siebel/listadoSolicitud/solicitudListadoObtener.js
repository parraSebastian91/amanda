const request = require('request');
const logger = require('./../../../utils/logger');
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL;
const token = require('../token/getToken');
// const siebelFormatDocument = require("../formats/siebelFormatDocument");

const solicitudListadoObtener = async (orden, rut = '') => {
  const getToken = await token();
  // var rutFormat = siebelFormatDocument(rut)
  // if (orden) {
  //   var bodyDataListadoObtener = {
  //     auth: {
  //       bearer: getToken.access_token
  //     },
  //     json: true,
  //     headers: {
  //       "Content-Type": "application/json",
  //       idServicio: "SolicitudListadoObtenerV1.1"
  //     },
  //     strictSSL: false,
  //     body: {
  //       Header: {
  //         country: "CL",
  //         commerce: "Falabella",
  //         channel: "Web"
  //       },
  //       Body: {
  //         SolicitudListadoObtenerReq: {
  //           SolicitudListadoObtener: {
  //             tipoIdentificacion: rutFormat.tipo,
  //             numeroIdentificacion: rutFormat.numero,
  //             digitoVerificador: rutFormat.digitoVerificador,
  //             canalOrigen: "IA",
  //             organizacion: "Falabella - Chile"
  //           }
  //         }
  //       }
  //     }
  //   };
  // } else {
  var bodyDataListadoObtener = {
    auth: {
      bearer: getToken.access_token
    },
    json: true,
    headers: {
      'Content-Type': 'application/json',
      idServicio: 'SolicitudListadoObtenerV1.1'
    },
    strictSSL: false,
    body: {
      Header: {
        country: 'CL',
        commerce: 'Falabella',
        channel: 'Web'
      },
      Body: {
        SolicitudListadoObtenerReq: {
          SolicitudListadoObtener: {
            tipoIdentificacion: '',
            numeroIdentificacion: '',
            digitoVerificador: '',
            canalOrigen: 'IA',
            organizacion: 'Falabella - Chile',
            orden
          }
        }
      }
    }
  };
  // }

  // comparar nivel 3, tipología y suborden
  const getList = await new Promise((resolve, reject) => {
    request.post(
      `${ siebelApiBaseurl }/Service_CallOut`,
      bodyDataListadoObtener,
      (err, res, body) => {
        if (err) {
          reject(err)
        };
        resolve(body);
      }
    );
  });
  logger.info(`solicitudListadoObtener, ${ JSON.stringify(getList) }`)
  return getList;
};

module.exports = solicitudListadoObtener;
