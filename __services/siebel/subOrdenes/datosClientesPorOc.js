const getToken = require("../token/getToken")
const logger = require('./../../../utils/logger')
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL
const request = require("request")
// const fn = require("../../../functions/methods");

// oc --> parameter
const datosClientesPorOc = async function (oc) {
  const token = await getToken()
  const req = {
    auth: {
      bearer: token.access_token
    },
    json: true,
    headers: {
      idServicio: "ClienteSubOrdenObtener"
    },
    strictSSL: false,
    body: {
      Header: {
        country: "CL",
        commerce: "Falabella",
        channel: "Web"
      },
      Body: {
        tipo: "CO",
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
              mensaje
            }
          }
        }
      } = getOrderInfo
      return mensaje
    } else if (getOrderInfo.response.Body.clienteSubOrdenResponse.orden) {
      const {
        response: {
          Body: {
            clienteSubOrdenResponse: {
              orden
            }
          }
        }
      } = getOrderInfo
      return orden
    }
    logger.info(`datosClientesPorOc, ${JSON.stringify(getOrderInfo)}`)
    return getOrderInfo
  } catch (error) {
    logger.error(`datosClientesPorOc, ${JSON.stringify(error)}`)
    //console.log('-----------------Error al consultar servicio ClienteSubordenObtener-----------------')
    let array = []
    return array
  }
}

module.exports = datosClientesPorOc