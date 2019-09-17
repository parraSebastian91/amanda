require('dotenv').config()
const request = require('request')
const moment = require('moment')
const logger = require('./../../utils/logger')
const siebelApiBaseurl = process.env.SIEBEL_API_BASEURL

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
      request.post(`${siebelApiBaseurl}/GetToken`, bodyDataToToken, (err, res, body) => {
        if (err) reject(err)
        resolve(body)
      })
    })

    return accessToken
  },
  async cancelRequest(srNumber, order_id, subOrders, tipificacionN3) {
    const getToken = await this.getToken()
    var fecha = moment().tz("America/Santiago").format('YYYY-MM-DD')
    let ss = srNumber
    var numeroSS1 = `SRX${ss.substring(2)}` /*srNumber.replace('-', '')*/
    var numeroSS2 = `Amanda_${ss.substring(2)}` /*srNumber.replace('-', '')*/
    //var numeroSS2 = `SBL_COupdate_${srNumber.replace('-', '')/*ss.substring(2)*/}`
    let cancelacion = "true"
    if (tipificacionN3 === 'Anulación de compra parcial') {
      cancelacion = "false"
    }
    try {
      var orderLinesConstruido = []
      subOrders.forEach(subOrder => {
        for (let index = 0; index < subOrder.products.length; index++) {
          const product = subOrder.products[index]
          let shipping_method = subOrder.delivery_status.option
          if (shipping_method == 'address') {
            shipping_method = 'ShipToAddress'
          } else if (shipping_method == 'store') {
            shipping_method = 'ShipToStore'
          } else {
            shipping_method = ''
          }

          orderLinesConstruido.push({
            LineNumber: product.line_id,
            ItemID: product.sku,
            PriceInfo: {
              Price: product.price
            },
            Quantity: {
              OrderedQty: product.quantity,
              OrderedQtyUOM: "unit"
            },
            Canceled: "true",
            ShippingInfo: {
              "DeliveryOption": shipping_method
            },
            Notes: {
              "Note": {
                "NoteType": "RR",
                "NoteText": "RR"
              }
            }
          })
        }
      })
    } catch (error) {
      logger.error(`getClienteLlamadaSolicitar, ${JSON.stringify(error)}`)
    }

    const bodyDataClientInfo = {
      auth: {
        bearer: getToken.access_token
      },
      json: true,
      headers: {
        'idServicio': 'CancelRequest'
      },
      strictSSL: false,
      body: {
        Body: {
          HeaderProducer: {
            ClientService: {
              country: "CL",
              commerce: "Falabella",
              channel: "SRX",
              date: fecha,
              hour: moment().format('h:mm:ss')
            }
          },
          BodyProducer: {
            Eom: {
              ActionType: "CancelOrder",
              DateTimeStamp: moment().format(),
              SequenceNumber: numeroSS1,
              ReferenceId: numeroSS2
            },
            Order: {
              OrderNumber: order_id,
              Canceled: cancelacion,
              OrderLines: {
                OrderLine: orderLinesConstruido
              }
            }
          }
        }
      }
    }
    logger.info(`bodyDataClientInfo, ${JSON.stringify(bodyDataClientInfo)}`)
    const infoClient = await new Promise((resolve, reject) => {
      request.post(`${siebelApiBaseurl}/ServiceCallOut`, bodyDataClientInfo, (err, res, body) => {
        if (err) reject(err)
        resolve(body)
      })
    })
    logger.info(`infoClient, ${JSON.stringify(infoClient)}`)
    return infoClient
  }
}