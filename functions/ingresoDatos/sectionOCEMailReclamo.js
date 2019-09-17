// *****************************************************************
// *                        Solo para webtracking                  *
// *****************************************************************
require('./sectionEmail')
require('./sectionOC')
require('./sectionPhone')
require('./sectionMetodoPago')
require('./sectionArgs')
require('./sectionArgsIncumplientoFecha')
//require('./sectionCheckbox')
require('./sectionCheckboxList')
const {MensajeBuscandoInfo} = require('../../utils')

//require('../../dialogs/consulta_reclamo')
//const botReply = require('./text')
bot.dialog('/sectionOCEMailReclamo', [
  // (session, args, next) => {
  //   // se quita debido a que no tiene sentido el dialogo en relacion al flujo
  //   //session.send(botReply.text1)
  //   session.beginDialog('/sectionEmail')
  // },
  // (session, results, next) => {
  //   session.userData.email = results.response
  //   session.beginDialog('/sectionOC')
  // },
  // async (session, results, next) => {
  //   session.userData.orderNumber = results.response
  //   session.beginDialog('/sectionPhone')
  // },
  async (session, results, next) => {
    if(session.userData.nivel3 == 'Incumplimiento fecha Entrega'){
      MensajeBuscandoInfo(session)
      session.userData.dataProgram.ServiceOn = true
      session.beginDialog('/sectionArgsIncumplientoFecha')
    }else{
      next()
    }
  },
  async (session, results, next) => {
    //session.send(`Estoy consultando los datos ingresados de la compra.`) Se reemplaza por MensajeBuscandoInfo - Historia SAC-1365
    MensajeBuscandoInfo(session)
    const getOrder = await WEBTRACKING.getOrder(session)
    const getPaymentMethods = await WEBTRACKING.getPaymentMethod(session)
    const ssR = await SIEBEL.solicitudListadoObtener(getOrder.state.id)
    var flagCallback = 0

    ////////////////////////////////////////////////////////////////////////////////////////////////
    //#27062018 RZA, modificacion callback backoffice
    //#ini_modificacion_callback_backoffice
    if (typeof ssR.SolicitudListadoObtenerOutput !== 'undefined' && ssR.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp != null) {
      if (typeof ssR.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener != 'undefined') {
        //ssR1='1-47565885448'//ss.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener[0].numeroSS
        solicitudDetalleObtener = await SIEBEL.solicitudDetalleObtener(ssR.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener[0].numeroSS)

        if (solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.ListaDeActividades != null) {
          var actividades = solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.ListaDeActividades.Actividades

          actividades.forEach(function(element, index, array) {
            _tipo = element.tipo
            _subTipo = element.subTipo
            _estado = element.estado
            _contactoCliente = element.texto4
          })
          /* solo para efectos de prueba, cambiar cuando el parametro contacto cliente este actualizado en SIEBEL
          _tipo = 'BackOffice'
          _subTipo = 'Contacto Inicial'
          _estado='Asignada'
          _contactoCliente='Sin Contacto / No contesta'
          */

          if (_tipo == 'BackOffice' && _subTipo == 'Contacto Inicial' && _estado == 'Asignada' && _contactoCliente == 'Sin Contacto / No contesta') {
            flagCallback = 1
            session.userData.ssCallback = 1
            session.beginDialog('/consulta_reclamo')
            //session.endConversation()
          }
        }
      } //fin modificacion callback
    }
    if (flagCallback == 0) { //ini flag callback
      console.info('getOrder')
      console.info(getOrder)
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
        session.userData.ticketSequence = getOrder.state.ticket_sequence
        session.userData.ticketTerminal = getOrder.state.ticket_terminal
        const products = getOrder.state.sub_orders[0].products
        //console.log(session.userData.subOrders)
        session.userData.subOrderNumber = getOrder.state.sub_orders[0].id
        session.userData.fechaCompra = getOrder.state.created_date
        session.userData.idTicket = getOrder.state.ticket_id
        const subOrden = getOrder.state.sub_orders
        session.userData.subOrders = subOrden
        if (subOrden.length > 0) {
          let subOrdenesProductos = new Array()
          let productsArray
          if (typeof session.userData.flagTotalEntregaFalso !== 'undefined' && session.userData.flagTotalEntregaFalso) {
            subOrden.forEach(function(e) {
              productsArray = new Array()
              e.macro_steps.forEach(function(m) {
                if (m.status == "Orden entregada") {
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
                }
              })
            })
          } else {
            subOrden.forEach(function(e) {
              productsArray = new Array()
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
          }
          session.userData.subOrdenesProductos = subOrdenesProductos
          console.info(JSON.stringify(getOrder.state))
          session.userData.order = {
            'order': getOrder.state,
            'itemsSelected': null
          }
          //session.beginDialog('/sectionCheckbox')
          session.beginDialog('/sectionCheckboxList')
        }
      } else {
        session.endConversation('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
        return
      }
    } //end flag callback
  },
  async (session, results, next) => {
    session.userData.checkBoxOrdersSelected = results
    if (session.userData.checkBoxOrdersSelected == null || session.userData.checkBoxOrdersSelected == '') {
      session.endConversation('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      return
    }
    session.beginDialog('/sectionArgs')
  }
])