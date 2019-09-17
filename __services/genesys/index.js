require('dotenv').config()
const request = require('request')
const moment = require('moment')
const logger = require('./../../utils/logger')
const phoneValidate = require('./../../functions/validaciones/telefono.js')

const genesysApiBaseurl = process.env.GENESYS_API_BASEURL

module.exports = {
  async getToken() {
    const bodyDataToToken = {
      auth: {
        user: process.env.MIDDLEWARE_USERNAME,
        pass: process.env.MIDDLEWARE_PASSWORD
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true,
      strictSSL: false
    }

    const accessToken = await new Promise((resolve, reject) => {
      request.post(`${genesysApiBaseurl}/GetToken`, bodyDataToToken, (err, res, body) => {
        if (err) reject(err)

        resolve(body)
      })
    })

    return accessToken
  },
  formatRut(rut) {
    const result = rut.replace(/-/g, '').replace(/\./g, '')
    return [result.slice(0, -1), result.slice(-1)]
  },
  getSolicitudEstadoOrden(info) {
    return "Puedes revisar el estado de tu orden ingresando a tus ordenes en el siguiente <a href='https://www.falabella.com/falabella-cl/mi-cuenta/ordenes?cbid=chatbot-webtracking' target='_blank'>link</a>"
  },
  async getClienteLlamadaSolicitar(info, descripcion_negocio = 'Falabella_SAC_CH', grupo_ejecutivos_backoffice = 'Soporte Amanda') {
    const getToken = await this.getToken()
    const rutFormat = await this.formatRut(info.rut)
    const resultSeparatePhone = phoneValidate.separatePhone({
      response: info.phone
    })
    var _Body = "";
    if (descripcion_negocio == 'FALABELLA_SAC_BO_CH') {
      if (grupo_ejecutivos_backoffice != '') {
        _Body = {
          clienteLlamadaSolicitarReqParam: {
            nombreCtc: info.nombreCtc,
            apellidoCtc: info.apellidoCtc,
            descNegocio: descripcion_negocio,
            idTransaccion: null,
            documentoCtc: rutFormat[0],
            digitoVer: rutFormat[1],
            tipoDocumento: '1',
            codigoArea: '',
            codigoPais: resultSeparatePhone.codigoPais,
            contactInfo: resultSeparatePhone.codigoArea + resultSeparatePhone.numero,
            contactInfoType: '1',
            userdefined1: grupo_ejecutivos_backoffice,
            userdefined2: info.ss,
            mailCh: info.mailCh
          }
        }
      }
    } else {
      _Body = {
        clienteLlamadaSolicitarReqParam: {
          nombreCtc: info.nombreCtc,
          apellidoCtc: info.apellidoCtc,
          descNegocio: descripcion_negocio,
          idTransaccion: null,
          documentoCtc: rutFormat[0],
          digitoVer: rutFormat[1],
          tipoDocumento: '1',
          codigoArea: '',
          codigoPais: resultSeparatePhone.codigoPais,
          contactInfo: resultSeparatePhone.codigoArea + resultSeparatePhone.numero,
          contactInfoType: '1',
          mailCh: info.mailCh
        }
      }
    }
    const bodyDataClientInfo = {
      auth: {
        bearer: getToken.access_token
      },
      json: true,
      headers: {
        'idServicio': 'ClienteLlamadaSolicitar'
      },
      strictSSL: false,
      body: {
        Header: {
          country: 'CL',
          commerce: 'Falabella',
          channel: 'Web'
        },
        Body: _Body
      }
    }
    logger.info(`bodyDataClientInfo, ${JSON.stringify(bodyDataClientInfo)}`)
    const infoClient = await new Promise((resolve, reject) => {
      request.post(`${genesysApiBaseurl}/ServiceCallOut`, bodyDataClientInfo, (err, res, body) => {
        if (err) reject(err)
        resolve(body)
      })
    })

    logger.info(`getClienteLlamadaSolicitar, ${JSON.stringify(infoClient)}`)

    return infoClient
  },
  async validarBloqueoDiaCallback(negocio_a_validar) {
    let arrayFechasBloqueadas = process.env.JSON_FECHAS_BLOQUEADAS_CALLBACK
    arrayFechasBloqueadas = JSON.parse(arrayFechasBloqueadas)
    let hoy = moment().format('DD/MM/YYYY')
    for (let negocio of arrayFechasBloqueadas) {
      if (negocio.nombre == negocio_a_validar) {
        let array_dias_bloqueados = negocio.dias_bloqueados
        if (array_dias_bloqueados.indexOf(hoy) == '-1') {
          return false
        } else {
          return true
        }
      }
    }
    return false
  }
}