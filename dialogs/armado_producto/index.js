require('./../../functions/ingresoDatos/sectionEndConversation')
require('./../../functions/ingresoDatos/sectionArgs')
require('./../../functions/ingresoDatos/sectionRun')
require('./../../functions/ingresoDatos/sectionPhone')
require('./../../functions/ingresoDatos/sectionOCValidadorPalabras')
require('./../../functions/ingresoDatos/sectionEmail')
require('./../../functions/ingresoDatos/sectionCheckboxList')
const { validacionRutMailPorOC } = require('./../../functions/validaciones/validaRutMailEnOC')

const botReply = require('./text')

bot.dialog('/armado_producto', [

  (session, args, next) => {
    session.send(botReply.text5)
    session.userData.nivel1 = 'Prod, Servicios y Gift Card'
    session.userData.nivel2 = 'Servicio Armado de Muebles'
    session.userData.nivel3 = 'Solicitud de armado'
    session.userData.tienda = 'Internet'
    session.userData.motivo = ''
    session.beginDialog('/sectionRun')
  },
  async (session, results, next) => {
    session.userData.dialogRetry = 1
    session.beginDialog('/sectionEmail')
  },
  async (session, results, next) => {
    session.userData.email = results.response
    session.beginDialog('/sectionPhone')
  },
  async (session, results, next) => {
    //session.beginDialog('/sectionOC')
    session.userData.dialogRetryOC = 1
    session.beginDialog('/sectionOCValidadorPalabras')
  },
  async (session, results, next) => {
    const datosCliente = await validacionRutMailPorOC(session.userData, false)
    if (!datosCliente.datosOK) {
      session.beginDialog('/end_conversation', { mensaje: datosCliente.mensaje })
      // session.send(datosCliente.mensaje)
      // MensajeDeAyuda(session)
      // session.endConversation()
    } else {
      next({ response: results.response })
    }
  },
  async (session, results, next) => {
    if (!results.resumed) {
      session.userData.orderNumber = results.response
      const getOrder = await WEBTRACKING.getOrder(session)
      const getPaymentMethods = await WEBTRACKING.getPaymentMethod(session)

      if (getOrder.success && getPaymentMethods.success && getPaymentMethods.state.type) {
        if (getPaymentMethods.state.type == 'debitPayment') {
          session.userData.mediopago = 'Tarjeta Débito'
        } else if (getPaymentMethods.state.type == 'cashPayment') {
          session.userData.mediopago = 'Efectivo'
        } else if (getPaymentMethods.state.type == 'creditOrCmrPayment') {
          if (getPaymentMethods.state.payment_mode == 'CMRCard') {
            session.userData.mediopago = 'Tarjeta CMR'
          } else {
            session.userData.mediopago = 'Tarjeta Crédito'
          }
        }
        const products = getOrder.state.sub_orders[0].products
        session.userData.subOrderNumber = getOrder.state.sub_orders[0].id
        session.userData.fechaCompra = getOrder.state.created_date
        session.userData.idTicket = getOrder.state.ticket_id
        const subOrden = getOrder.state.sub_orders
        session.userData.subOrders = getOrder.state.sub_orders
        if (subOrden.length > 0) {
          let subOrdenesProductos = new Array()
          subOrden.forEach(function (e) {
            let productsArray = new Array()
            e.products.forEach(function (ee) {
              productsArray.push({
                'value': `${ee.description}`,
                'image': `${ee.image_url}`
              })
            })
            subOrdenesProductos.push({
              'fecha': e.delivery_status.initial_date,
              'value': e.id,
              'products': productsArray
            })
          })
          session.userData.subOrdenesProductos = subOrdenesProductos
          console.info(JSON.stringify(getOrder.state))
          session.userData.order = {
            'order': getOrder.state,
            'itemsSelected': null
          }
          next()
        }
      } else {
        session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
        session.endConversation()
      }
    } else {
      session.userData.sectionSalida = '/cambio_producto'
      session.beginDialog('/salida')
    }
  },
  async (session, results, next) => {
    const menuOptions = `SI|NO`
    const menuText = 'Estoy buscando datos de tu compra. ¿Realizaste el pago del servicio de armado de producto?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 2
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      if (results.response.entity == 'SI') {
        next()
      } else {
        session.send('Si no has realizado la compra del servicio de armado, puedes dirigirte a cualquier de nuestras tiendas con la boleta del mueble que deseas armar y realizar la compra del servicio.')
        session.endConversation()
      }
    }
  },
  async (session, results, next) => {
    const menuOptions = `SI|NO`
    const menuText = '¿Deseas realizar el armado de tu producto en la misma dirección en que agendaste el despacho?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 2
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      if (results.response.entity == 'SI') {
        session.beginDialog('/choiceProducto')
      } else {
        session.send('Si deseas solicitar el armado del producto en otra dirección puedes contactarte con nuestros ejecutivos al [600 380 5000](6003805000).')
        session.endConversation()
      }
    }
  }
])

bot.dialog('/choiceProducto', [
  (session, args, next) => {
    session.beginDialog('/sectionCheckboxList')
  },
  (session, results, next) => {
    session.userData.checkBoxOrdersSelected = results
    if (session.userData.checkBoxOrdersSelected == null || session.userData.checkBoxOrdersSelected == '') {
      session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      session.endConversation()
    }
    session.userData.isArmado = true
    session.beginDialog('/sectionArgs')
  }
])