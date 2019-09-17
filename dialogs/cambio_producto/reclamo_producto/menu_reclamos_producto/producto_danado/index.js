require('./../../../../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda,MensajeBuscandoInfo } = require("../../../../../utils")
bot.dialog('/producto_danado', [
  async (session, results, next) => {
    if (session.userData.rut && session.userData.orden_compra && session.userData.email) {
      session.userData.orderNumber = session.userData.orden_compra
      MensajeBuscandoInfo(session)
      const getOrder = await WEBTRACKING.getOrder(session)
      const medioPago = await CONTROLLER.obtenerMetodoPago(session)
      if (medioPago != "" && getOrder.success) {
        session.userData.mediopago = medioPago
        session.userData.motivo = ""
        session.userData.subOrderNumber = getOrder.state.sub_orders[0].id
        session.userData.fechaCompra = getOrder.state.created_date
        session.userData.idTicket = getOrder.state.ticket_id
        const subOrden = getOrder.state.sub_orders
        session.userData.subOrders = getOrder.state.sub_orders
        if (subOrden.length > 0) {
          let subOrdenesProductos = new Array()
          subOrden.forEach(function(e) {
            let productsArray = new Array()
            e.products.forEach(function(ee) {
              productsArray.push({
                'value': `${ ee.description }`,
                'image': `${ ee.image_url }`
              })
            })
            subOrdenesProductos.push({
              'fecha': e.delivery_status.initial_date,
              'value': e.id,
              'products': productsArray
            })
          })
          session.userData.subOrdenesProductos = subOrdenesProductos
          session.userData.order = {
            'order': getOrder.state,
            'itemsSelected': null
          }
          session.beginDialog('/sectionCheckboxList')
        }
      } else {
        session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
        session.endConversation()
      }
    } else {
      session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      session.endConversation()
    }
  },
  async (session, results, next) => {
    session.userData.checkBoxOrdersSelected = results
    if (session.userData.checkBoxOrdersSelected == null || session.userData.checkBoxOrdersSelected == '') {
      session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      session.endConversation()
    }
    let ordersArray = []
    ordersArray = session.userData.checkBoxOrdersSelected
    session.userData.motivo_reclamo = "Cliente solicita cambio de su producto a través de Amanda. Favor validar que cumple políticas para gestionar el cambio de producto"
    const existeDuplicidad = await CONTROLLER.problemasProductos.duplicidadSS(session)
    if (!existeDuplicidad.duplicidad) {
      const currentClientInfo = await new Promise((resolve, reject) => {
        resolve(SIEBEL.getClientInfo(session.userData.rut))
      })
      const resultCreateSS = await CONTROLLER.subOrdenCreateSS(ordersArray, currentClientInfo, session)
      const msg = await CONTROLLER.problemasProductos.crearMensaje(session, resultCreateSS)
      session.beginDialog('/end_conversation', { mensaje: msg })
      // session.send(msg)
      // MensajeDeAyuda(session)
      // session.endConversation()
    } else {
      session.beginDialog('/end_conversation', { mensaje: existeDuplicidad.mensaje })
      // session.send(existeDuplicidad.mensaje)
      // MensajeDeAyuda(session)
      // session.endConversation()
    }
  }
])