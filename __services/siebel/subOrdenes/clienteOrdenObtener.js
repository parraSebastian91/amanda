const getToken = require('../token/getToken')
const logger = require('./../../../utils/logger')
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL
const request = require('request')
// const fn = require('../../../functions/methods');

// oc --> parameter
const clienteOrdenObtener = async function (oc) {
  const token = await getToken()
  const req = {
    auth: {
      bearer: token.access_token
    },
    json: true,
    headers: {
      idServicio: 'ClienteSubOrdenObtener'
    },
    strictSSL: false,
    body: {
      Header: {
        country: 'CL',
        commerce: 'Falabella',
        channel: 'Web'
      },
      Body: {
        tipo: 'CO',
        id: oc
      }
    }
  }

  try {
    const getOrderInfo = await new Promise((resolve, reject) => {
      request.post(
        `${siebelApiBaseurl}/ServiceCallOut`,
        req,
        (err, res, body) => {
          if (err) {
            reject(err)
          }
          resolve(body)
        }
      )
    })
    if (getOrderInfo.response.Body.clienteSubOrdenResponse.mensaje) {
      const {
        response: {
          Body: {
            clienteSubOrdenResponse: {
              mensaje: { descripcion: mensaje }
            }
          }
        }
      } = getOrderInfo
      return [{ mensaje: mensaje }]
    } else if (getOrderInfo.response.Body.clienteSubOrdenResponse.subOrdenLista) {
      const {
        response: {
          Body: {
            clienteSubOrdenResponse: { orden }
          }
        }
      } = getOrderInfo
      return orden
    }
    logger.info(`clienteOrdenObtener, ${JSON.stringify(getOrderInfo)}`)
    return getOrderInfo
  } catch (error) {
    logger.error(`clienteOrdenObtener, ${JSON.stringify(error)}`)
    //console.log('-----------------Error al consultar servicio ClienteSubordenObtener-----------------')
    let array = []
    return array
  }
}

module.exports = clienteOrdenObtener
