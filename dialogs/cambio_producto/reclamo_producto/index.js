require('./../../../functions/ingresoDatos/sectionEndConversation')
require('./../reclamo_producto/menu_reclamos_producto')
require('./../../../functions/ingresoDatos/sectionEmail')
require('./../../../functions/ingresoDatos/sectionRun')
require('./../../../functions/ingresoDatos/sectionOCValidadorPalabras')
const { MensajeDeAyuda } = require('../../../utils')
const { validacionRutMailPorOC } = require('./../../../functions/validaciones/validaRutMailEnOC')
const validarFechaSessionActiva = require('./../../../functions/validaciones/fecha').validarFechaSessionActiva
const { limpiaSession } = require('../../../utils')

bot.dialog('/reclamo_producto', [
  async (session, results, next) => {
    limpiaSession(session)
    if (!validarFechaSessionActiva(session.userData)) {
      session.userData.dialogRetryOC = 1
      session.beginDialog('/sectionOCValidadorPalabras')
    } else {
      session.userData.dialogRetryOC = 1
      session.userData.rut = session.userData.dataPersonal.rutUsuario
      session.userData.email = session.userData.dataPersonal.emailUsuario
      session.beginDialog('/sectionOCValidadorPalabras')
    }
  },
  async (session, results, next) => {
    if (session.userData.email) {
      next()
    } else {
      session.userData.dialogRetry = 1
      session.beginDialog('/sectionEmail')
    }
  },
  (session, results, next) => {
    if (session.userData.rut) {
      next()
    } else {
      session.userData.email = results.response
      session.beginDialog('/sectionRun')
    }
  },
  async (session, results, next) => {
    const datosCliente = await validacionRutMailPorOC(session.userData, false)
    if (!datosCliente.datosOK) {
      session.beginDialog('/end_conversation', { mensaje: datosCliente.mensaje })
      // session.send(datosCliente.mensaje)
      // MensajeDeAyuda(session)
      // session.endConversation()
    } else {
      next()
    }
  },
  async (session, args, next) => {
    session.userData.orderNumber = session.userData.orden_compra
    let getOrder = await WEBTRACKING.getOrder(session)
    if (getOrder.success) {
      let ordenEntregada = false
      getOrder.state.sub_orders.forEach(function(e) {
        console.log(e.macro_steps)
        if (e.macro_steps.pop().status === 'Orden entregada') {
          ordenEntregada = true
        }
      })
      if (ordenEntregada === true) {
        session.beginDialog('/menu_reclamos_producto')
      } else {
        let msj = 'Estimado cliente, para poder gestionar el cambio de tu producto debes primero recibir tu despacho para luego poder ingresar tu solicitud. Una vez que recibas tu despacho contáctame y te ayudaré'
        session.beginDialog('/end_conversation', { mensaje: msj })
        // session.send('Estimado cliente, para poder gestionar el cambio de tu producto debes primero recibir tu despacho para luego poder ingresar tu solicitud. Una vez que recibas tu despacho contáctame y te ayudaré')
        // session.endConversation()
        // MensajeDeAyuda(session)
      }
    } else {
      let msj = 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
      session.beginDialog('/end_conversation', { mensaje: msj })
      // session.send()
      // session.endConversation()
      // MensajeDeAyuda(session)
    }
  }
])
