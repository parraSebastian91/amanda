const request = require('request')
const logger = require('./../../../utils/logger')
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL
const token = require('../token/getToken')

const simpleCreatesSS = async info => {
  const getToken = await token();
  let serviceRequestObject = {
    estadoF12: info.ServiceRequest.estadoF12,
    nivel1: info.ServiceRequest.nivel1,
    nivel2: info.ServiceRequest.nivel2,
    nivel3: info.ServiceRequest.nivel3,
    canal: 'Asistente Virtual',
    descripcion: info.ServiceRequest.descripcion,
    numeroOrdenCompra: info.ServiceRequest.numeroOrdenCompra,
    Attachment: '',
    texto1: 'Front'
  }
  const requestSS = {
    auth: {
      bearer: getToken.access_token
    },
    json: true,
    headers: {
      idServicio: 'ServicioSolicitudCrearV1.1'
    },
    strictSSL: false,
    body: {
      Header: {
        country: 'CL',
        commerce: 'Falabella',
        channel: 'Web'
      },
      Body: {
        CreateServiceRequest: {
          Account: {
            organizacion: 'Falabella - Chile',
            documento: {
              tipo: 'RUT',
              numero: info.persona.documento.numero,
              digitoVerificador: info.persona.documento.digitoVerificador
            },
            nombre: info.persona.nombre,
            nacionalidad: info.persona.nacionalidad,
            apellidoMaterno: null,
            apellidoPaterno: info.persona.apellidoPaterno,
            ListOfTelefono: {
              Telefono: [info.persona.telefono]
            },
            ServiceRequest: serviceRequestObject
          }
        }
      }
    }
  }
  try {
    const getSS = await new Promise((resolve, reject) => {
      request.post(
        `${siebelApiBaseurl}/Service_CallOut`,
        requestSS,
        (err, res, body) => {
          if (err) reject(err)
          resolve(body)
        }
      )
    })
    if (getSS.response.Body.ServicioSolicitudCrearResp.errorSpcCode === '0' || getSS.response.Body.ServicioSolicitudCrearResp.errorSpcCode === 0) {
      logger.info(`simpleCreatesSS, ${JSON.stringify(getSS)}`)
      return {
        codigo: 0,
        mensaje: '',
        srNumber: getSS.response.Body.ServicioSolicitudCrearResp.srNumber
      }
    }
    logger.error(`simpleCreatesSS, ${JSON.stringify(getSS)}`)
    return {
      codigo: 1,
      mensaje: 'Ha ocurrido un inconveniente al ingresar la solicitud de servicio. Intente más tarde por favor',
      srNumber: null
    }
  } catch (error) {
    logger.error(`simpleCreatesSS, ${JSON.stringify(error)}`)
    return {
      codigo: 1,
      mensaje: 'Ha ocurrido un inconveniente al ingresar la solicitud de servicio. Intente más tarde por favor',
      srNumber: null
    }
  }
}

module.exports = simpleCreatesSS