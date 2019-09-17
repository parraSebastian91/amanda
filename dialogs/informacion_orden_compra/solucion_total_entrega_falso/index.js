require('./../../../functions/ingresoDatos/sectionEndConversation')
require('./../../../functions/ingresoDatos/sectionCheckboxList.js')
require('./../enrutador')
const botReply = require('./../text.js')
const { MensajeDeAyuda } = require('../../../utils')
const { TIPOLOGIA } = require('../functions')
const intentLuis = require('../../../functions/salidaDinamica')
const logger = require('./../../../utils/logger')
const { listaProductos } = require('./../../../utils/adaptiveCardImagenes')
const { AdaptiveCard,OfuscarCorreo } = require('../../../utils')

function validaMenu(session) {
  return (session.message.value == undefined && session.userData.flagSiNo == undefined)
}

bot.dialog('/solucion_total_entrega_falso', [
  (session, args, next) => {
    if (validaMenu(session)) {
      logger.info('Dialogo: solucion_total_entrega_falso.')
      let solicitud = session.userData.solicitudesPendientes[0].sub_orden;

      var cantProduct = solicitud.products.length;
      let textFinal = 'Porque nos preocupamos de que recibas tu despacho en buen estado, me gustaría confirmar si recibiste '
      textFinal += (cantProduct === 1) ? 'tu producto ' : 'tus productos '
      let fechaRecepcion = (solicitud.delivery_status.rescheduled_date != null) ? solicitud.delivery_status.rescheduled_date : solicitud.delivery_status.initial_date
      let fechaSplit = fechaRecepcion.split('/')
      textFinal += `asociados al despacho ${ solicitud.id } que recibiste el día  ${ fechaSplit[2] + '/' + fechaSplit[1] + '/' + fechaSplit[0] }`

      let productosBody = listaProductos(solicitud, '', textFinal)
      let action = [{
        'type': 'Action.Submit',
        'title': 'SI',
        'data': { 'opcionMenu': 'SI' }
      }, {
        'type': 'Action.Submit',
        'title': 'NO',
        'data': { 'opcionMenu': 'NO' }
      }
      ]
      session.userData.flagSiNo = true
      session.userData.dataProgram.ServiceOn = false // Activa la escucha para mensajes del usuario
      session.send(AdaptiveCard(session, productosBody, action))      
    } else {
      let resultado = (session.message.value != undefined) ? session.message.value.opcionMenu : session.message.text
      session.userData.flagSiNo = false
      next({ resultado })
    }
  },
  async (session, results, next) => {
    if (session.userData.flagSiNo != undefined && session.userData.flagSiNo == false) {
      delete session.userData.flagSiNo
      if (results.resultado.toUpperCase() == 'SI') {
        delete session.message.value
        let msj = '$recibido_si$ ¡Que bueno! Recuerda que si tienes algún inconveniente con tu producto o despacho puedes hablar conmigo.'
        session.beginDialog('/end_conversation', { mensaje: msj })
        // session.send()
        // MensajeDeAyuda(session)
        // session.endConversation()
        try {
          session.userData.solicitudesPendientes = await TIPOLOGIA.removeElementArray(session.userData.solicitudesPendientes)
          if (session.userData.solicitudesPendientes.length > 0) {
            session.beginDialog('/enrutador')
          } else {
            session.userData.solicitudesPendientesLength = 1
            session.userData.solicitudesPendientes = []
            //session.beginDialog('/end_conversation') 
            // session.endConversation()
            // MensajeDeAyuda(session)
            // //
            return
          }
        } catch (error) {
          logger.error(`Dialogo: incumplimiento_sin_stock; ${ JSON.stringify(error) }`)
          //console.log(`Error:/incumplimiento_sin_stock; ${error}`)
          session.userData.solicitudesPendientesLength = 1
          session.userData.solicitudesPendientes = []
          let msg = 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
          session.beginDialog('/end_conversation', { mensaje: msg })
          // session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
          // session.endConversation()
        }
      } else if (results.resultado.toUpperCase() == 'NO') {
        //########################################    
        const subOrden = session.userData.solicitudesPendientes[0].sub_orden
        //########################################
        if (subOrden) {
          let subOrdenesProductos = new Array()
          let productsArray = new Array()
          subOrden.macro_steps.forEach(function(m) {
            if (m.status == 'Orden entregada') {
              subOrden.products.forEach(function(ee) {
                productsArray.push({
                  'value': `${ ee.description }`,
                  'image': `${ ee.image_url }`
                })
              })
              subOrdenesProductos.push({
                'fecha': subOrden.delivery_status.initial_date,
                'value': subOrden.id,
                'products': productsArray
              })
            }
          })
          session.userData.subOrdenesProductos = subOrdenesProductos
          session.userData.order = {
            'order': session.userData.state,
            'itemsSelected': null
          }
          session.beginDialog('/sectionCheckboxList', {
            'tituloList': `Nos puedes indicar ${ (subOrdenesProductos.length > 1) ? 'cuáles despachos' : 'cuál despacho' }  no has recibido:`
          })
        }
      }
    } else {
      let resultIntent = await intentLuis.dialogIntent(session)
      session.beginDialog(`/${ resultIntent }`)
      return
    }
  },
  async (session, results, next) => {
    if (results.length > 0) {
      let arraySubOrdenesConTotalEntregaFalso = results
      let flagDuplicidadSS
      if (arraySubOrdenesConTotalEntregaFalso.length > 0) {
        for (let subOrden of arraySubOrdenesConTotalEntregaFalso) {
          flagDuplicidadSS = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(
            session.userData.rut,
            session.userData.orden_compra,
            subOrden,
            'Incumplimiento fecha Entrega'
          )
        }
      } else {
        flagDuplicidadSS = []
      }
      if (flagDuplicidadSS.length == 0 && arraySubOrdenesConTotalEntregaFalso.length > 0) {
        if (arraySubOrdenesConTotalEntregaFalso.length > 0) {
          session.userData.arraySubOrdenesConTotalEntregaFalso = arraySubOrdenesConTotalEntregaFalso
          let resultCreateSS = await CONTROLLER.seguimientoOrden.createSSTotalEntregaFalso(session)
          console.log(resultCreateSS)
          let botReplyMsg = botReply.message('ss')
          let reclamoMsg = (resultCreateSS.success.length == 0) ? '' : '$recibido_no_ss$' + botReplyMsg.titulo
          resultCreateSS.success.forEach(obj => {
            reclamoMsg += '<br> &bull; ' + obj.msg
          })
          if (resultCreateSS.error.length > 0) {
            reclamoMsg += '<br> No Pudimos registar la solicitud para el Despacho:'
          }
          resultCreateSS.error.forEach(obj => {
            reclamoMsg += '<br> &bull; ' + obj.subOrden + '<br>' + obj.msg
          })
          if (resultCreateSS.success.length > 0) {
            session.userData.flagCreate = true
            reclamoMsg += '<br> ' + botReplyMsg.pie
            reclamoMsg += '<br> ' + botReplyMsg.correo.replace('{{correo}}', OfuscarCorreo(session.userData.email))
          }
          session.send(reclamoMsg)
        }
      } else if (flagDuplicidadSS.length > 0 && arraySubOrdenesConTotalEntregaFalso.length > 0) {
        session.userData.nivel1 = 'Consultas Generales'
        session.userData.nivel2 = 'Estado del reclamo'
        session.userData.nivel3 = 'Estado del reclamo'
        session.userData.motivo_reclamo = 'First Contact Resolution'
        session.userData.motivo = ''
        session.userData.numeroSubOrdenFCR = flagDuplicidadSS[0].numeroSubOrden
        session.userData.numeroSSFCR = flagDuplicidadSS[0].numeroSS
        let createFCR = await CONTROLLER.createFCR(null, session.userData.currentClientInfo, session)
        if (createFCR.success.length > 0) {
          session.userData.flagCreate = true
          session.send('$recibido_no_fcr$ ' + botReply.message())
        } else {
          session.send(botReply.message('error'))
        }
      }
      try {
        session.userData.solicitudesPendientes = await TIPOLOGIA.removeElementArray(session.userData.solicitudesPendientes);
        if (session.userData.solicitudesPendientes.length > 0) {
          session.beginDialog('/enrutador')
        } else {
          session.userData.solicitudesPendientesLength = 1
          session.userData.solicitudesPendientes = []
          session.beginDialog('/end_conversation')
          // session.endConversation()
          // MensajeDeAyuda(session)
        }
      } catch (error) {
        logger.error(`Dialogo:/incumplimiento_sin_stock; ${ JSON.stringify(error) }`)
        //console.log(`Error:/incumplimiento_sin_stock; ${error}`)
        session.userData.solicitudesPendientesLength = 1
        session.userData.solicitudesPendientes = []
        let msg = 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
        session.beginDialog('/end_conversation', { mensaje: msg })
        // session.send()
        // session.endConversation()
        return
      }
    } else {
      session.userData.solicitudesPendientesLength = 1
      session.userData.solicitudesPendientes = []
      logger.error('Dialogo: solucion_total_entrega_falso; Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      // session.endConversation()
      let msg = 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
      session.beginDialog('/end_conversation', { mensaje: msg })
      return
    }
  }
])