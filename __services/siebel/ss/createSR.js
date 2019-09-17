const request = require('request')
const logger = require('./../../../utils/logger')
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL
const token = require('../token/getToken')

const createSR = async (info, solicitud_servicio_asociada = '') => {
  const getToken = await token();
  let serviceRequestObject = '';
  if (info.ServiceRequest.idTicket && info.ServiceRequest.terminal && info.ServiceRequest.secuencia) {
    if (solicitud_servicio_asociada !== '') {
      serviceRequestObject = {
        estadoF12: info.ServiceRequest.estadoF12,
        nivel1: info.ServiceRequest.nivel1,
        nivel2: info.ServiceRequest.nivel2,
        nivel3: info.ServiceRequest.nivel3,
        canal: 'Asistente Virtual',
        descripcion: info.ServiceRequest.descripcion,
        numeroBoleta: info.ServiceRequest.idTicket, // cm
        medioPago: info.ServiceRequest.medioPago,
        fechaCompra: info.ServiceRequest.fechaCompra,
        numeroOrdenCompra: info.ServiceRequest.numeroOrdenCompra,
        tiendaOrigen: info.ServiceRequest.tiendaOrigen,
        sku: info.ServiceRequest.sku,
        numeroSuborden: info.ServiceRequest.numeroSuborden,
        terminal: info.ServiceRequest.terminal, // cm
        secuencia: info.ServiceRequest.secuencia, // cm
        Attachment: '',
        ListOfSKUF12: info.ServiceRequest.ListOfSKUF12,
        texto1: 'Front',
        texto2: solicitud_servicio_asociada
      };
    } else {
      serviceRequestObject = {
        estadoF12: info.ServiceRequest.estadoF12,
        nivel1: info.ServiceRequest.nivel1,
        nivel2: info.ServiceRequest.nivel2,
        nivel3: info.ServiceRequest.nivel3,
        canal: 'Asistente Virtual',
        descripcion: info.ServiceRequest.descripcion,
        numeroBoleta: info.ServiceRequest.idTicket, // cm
        medioPago: info.ServiceRequest.medioPago,
        fechaCompra: info.ServiceRequest.fechaCompra,
        numeroOrdenCompra: info.ServiceRequest.numeroOrdenCompra,
        tiendaOrigen: info.ServiceRequest.tiendaOrigen,
        sku: info.ServiceRequest.sku,
        numeroSuborden: info.ServiceRequest.numeroSuborden,
        terminal: info.ServiceRequest.terminal, // cm
        secuencia: info.ServiceRequest.secuencia, // cm
        Attachment: '',
        ListOfSKUF12: info.ServiceRequest.ListOfSKUF12,
        texto1: 'Front'
      };
    }
  } else {
    if (solicitud_servicio_asociada !== '') {
      serviceRequestObject = {
        estadoF12: info.ServiceRequest.estadoF12,
        nivel1: info.ServiceRequest.nivel1,
        nivel2: info.ServiceRequest.nivel2,
        nivel3: info.ServiceRequest.nivel3,
        canal: 'Asistente Virtual',
        descripcion: info.ServiceRequest.descripcion,
        numeroBoleta: info.ServiceRequest.idTicket, // cm
        medioPago: info.ServiceRequest.medioPago,
        fechaCompra: info.ServiceRequest.fechaCompra,
        numeroOrdenCompra: info.ServiceRequest.numeroOrdenCompra,
        tiendaOrigen: info.ServiceRequest.tiendaOrigen,
        sku: info.ServiceRequest.sku,
        numeroSuborden: info.ServiceRequest.numeroSuborden,
        terminal: info.ServiceRequest.terminal, // cm
        secuencia: info.ServiceRequest.secuencia, // cm
        Attachment: '',
        ListOfSKUF12: info.ServiceRequest.ListOfSKUF12,
        texto1: 'Front',
        texto2: solicitud_servicio_asociada
      };
    } else {
      serviceRequestObject = {
        estadoF12: info.ServiceRequest.estadoF12,
        nivel1: info.ServiceRequest.nivel1,
        nivel2: info.ServiceRequest.nivel2,
        nivel3: info.ServiceRequest.nivel3,
        canal: 'Asistente Virtual',
        descripcion: info.ServiceRequest.descripcion,
        numeroBoleta: info.ServiceRequest.idTicket, // cm
        medioPago: info.ServiceRequest.medioPago,
        fechaCompra: info.ServiceRequest.fechaCompra,
        numeroOrdenCompra: info.ServiceRequest.numeroOrdenCompra,
        tiendaOrigen: info.ServiceRequest.tiendaOrigen,
        sku: info.ServiceRequest.sku,
        numeroSuborden: info.ServiceRequest.numeroSuborden,
        terminal: info.ServiceRequest.terminal, // cm
        secuencia: info.ServiceRequest.secuencia, // cm
        Attachment: '',
        ListOfSKUF12: info.ServiceRequest.ListOfSKUF12,
        texto1: 'Front'
      };
    }
    serviceRequestObject = {
      estadoF12: info.ServiceRequest.estadoF12,
      nivel1: info.ServiceRequest.nivel1,
      nivel2: info.ServiceRequest.nivel2,
      nivel3: info.ServiceRequest.nivel3,
      canal: 'Asistente Virtual',
      descripcion: info.ServiceRequest.descripcion,
      // numeroBoleta: info.ServiceRequest.idTicket,
      medioPago: info.ServiceRequest.medioPago,
      fechaCompra: info.ServiceRequest.fechaCompra,
      numeroOrdenCompra: info.ServiceRequest.numeroOrdenCompra,
      tiendaOrigen: info.ServiceRequest.tiendaOrigen,
      sku: info.ServiceRequest.sku,
      numeroSuborden: info.ServiceRequest.numeroSuborden,
      // terminal: info.orden.terminal,
      // secuencia: info.orden.secuencia,
      Attachment: '',
      ListOfSKUF12: info.ServiceRequest.ListOfSKUF12,
      texto1: 'Front'
    };
  }
  const SR = {
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
            // fechaNacimiento: null, //info.persona.fechaNacimiento,
            nacionalidad: info.persona.nacionalidad,
            apellidoMaterno: null, // info.persona.apellidoMaterno,
            apellidoPaterno: info.persona.apellidoPaterno,
            ListOfTelefono: {
              Telefono: [info.persona.Telefono]
            },
            ServiceRequest: serviceRequestObject
          }
        }
      }
    }
  }
  try {
    if (!info.persona.Telefono) {
      // Se remueve el ListOfTelefono si telefono == null
      delete SR.body.Body.CreateServiceRequest.Account.ListOfTelefono
    }
    // console.info(SR)
    console.info(JSON.stringify(SR))
    const getSR = await new Promise((resolve, reject) => {
      request.post(
        `${ siebelApiBaseurl }/Service_CallOut`,
        SR,
        (err, res, body) => {
          if (err) {
            reject(err)
          }
          resolve(body)
        }
      )
    })
    if (getSR.response.Body.ServicioSolicitudCrearResp.errorSpcCode === '0' || getSR.response.Body.ServicioSolicitudCrearResp.errorSpcCode === 0) {
      logger.info(`createSR , ${ JSON.stringify(getSR) }`)
      return {
        codigo: 0,
        mensaje: '',
        srNumber: getSR.response.Body.ServicioSolicitudCrearResp.srNumber
      };
    }
    logger.error(`createSR, ${ JSON.stringify(getSR) }`)
    return {
      codigo: 1,
      mensaje: 'Ha ocurrido un inconveniente al ingresar la solicitud de servicio. Intente más tarde por favor',
      srNumber: null
    };
  } catch (error) {
    logger.error(`createSR, ${ JSON.stringify(error) }`)
    return {
      codigo: 1,
      mensaje: 'Ha ocurrido un inconveniente al ingresar la solicitud de servicio. Intente más tarde por favor',
      srNumber: null
    }
  }
}

module.exports = createSR
