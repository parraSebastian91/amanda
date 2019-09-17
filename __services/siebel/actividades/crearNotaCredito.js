const request = require("request")
const logger = require('./../../../utils/logger')
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL
const token = require("../token/getToken")

const CrearNotaCredito = async (info, tipo, subtipo, descripcion = '') => {
  const getToken = await token()
  const requestSS = {
    auth: {
      bearer: getToken.access_token
    },
    json: true,
    headers: {
      'idServicio': 'ActividadDetalleRegistrar'
    },
    strictSSL: false,
    body: {
      Header: {
        country: 'CL',
        commerce: 'Falabella',
        channel: 'Web'
      },
      Body: {
        ListaDeActividadesCreacion: {
          ActividadDetalleRegistrar: {
            organizacion: 'Falabella - Chile',
            canalOrigen: 'CRM',
            tipoDocumento: 'RUT',
            numeroDocumento: info.numeroDocumento,
            digitoVerificador: info.digitoVerificador,
            numeroSS: info.numeroSS,
            ListaDeActividades: {
              Actividad: [{
                estado: 'Asignada',
                propietario: null,
                division: null,
                categoria: 'Actividad',
                tipo: tipo,
                subTipo: subtipo,
                descripcion: descripcion,
                comentarios: ''
              }]
            }
          }
        }
      }
    }
  }
  try {
    const getSS = await new Promise((resolve, reject) => {
      request.post(`${siebelApiBaseurl}/Service_CallOut`, requestSS, (err, res, body) => {
        if (err) reject(err)
        resolve(body)
      })
    })
    if (getSS.ActividadDetalleRegistrarOutput.codigoRetorno == 0) {
      return {
        'codigo': 0,
        'mensaje': getSS.ActividadDetalleRegistrarOutput.mensajeRetorno,
        'crearNC': 'ncOk'
      }
    } else {
      logger.error(`ActividadDetalleRegistrarOutput, ${JSON.stringify(ActividadDetalleRegistrarOutput)}`)
      return {
        'codigo': 1,
        'mensaje': 'Ha ocurrido un inconveniente al ingresar la solicitud de Nota de Crédito. Intente más tarde',
        'crearNC': 'ncError'
      }
    }
  } catch (error) {
    logger.error(`CrearNotaCredito, ${JSON.stringify(error)}`)
    return {
      'codigo': 1,
      'mensaje': 'Ha ocurrido un inconveniente al ingresar la solicitud de Nota de Crédito. Intente más tarde'
    }
  }
}

module.exports = CrearNotaCredito