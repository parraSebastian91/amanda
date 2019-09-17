require('./../../../../../functions/ingresoDatos/sectionEndConversation')
const ServClienteOrdenObtener = require('../../../../../__services/siebel/subOrdenes/clienteOrdenObtener')
const ServSimpleCreateSS = require('../../../../../__services/siebel/ss/simpleCreatesSS')
const ServGetClientInfo = require('../../../../../__services/siebel/clientInfo/getClientInfo')
const MetodValidarTelefono = require('../../../../../functions/validaciones/telefono')
const MetodValidarPorOCDuplicidad = require('../../../../../__services/siebel/listadoSolicitud/calcularSolicitudListadoObtenerPorOC')
const { MensajeDeAyuda } = require('../../../../../utils')
const { listaProductosPorOC } = require('../../../../../utils/adaptiveCardImagenesPorOC')
const { TIPOLOGIA } = require('./../../../../informacion_orden_compra/functions')
const { AdaptiveCard,MensajeBuscandoInfo } = require('../../../../../utils')
const botReply = require('../text')
const logger = require('./../../../../../utils/logger')

function validaMenu(session) {
  let menuValido = false
  if (session.message.value == undefined && session.userData.flagConfirma == undefined) {
    menuValido = true
  }
  return menuValido
}
function datosTextMenu(dataMenu, session) {
  let resultado = ''
  if(Array.isArray(dataMenu)){
    session.userData.flagConfirma = false
    resultado = dataMenu[0].opcionMenu
    session.userData.reprompt = dataMenu[1].reprompt
  } else if (dataMenu.toLowerCase() == 'confirmar') {
    session.userData.reprompt = true
    resultado = 'confirmar'
  } else if (dataMenu.toLowerCase() == 'cancelar') {
    resultado = 'cancelar'
    session.userData.reprompt = false
  }  
  return {resultado}
}
bot.dialog('/errores_en_cobros', [
  async (session, args, next) => {
    logger.info("Dialogo: errores_en_cobros.")
    if (validaMenu(session) && args == undefined) {
      // adaptive card con detalle de error en cobro por orden de compra
      MensajeBuscandoInfo(session)
      const orden = await TIPOLOGIA.webtrackingProcess(session)
      let fechaCompra = orden.state.created_date.split('/')
      let fechaCompraOc = fechaCompra[2]+ '/' +fechaCompra[1]+ '/' +fechaCompra[0]
      const productos = listaProductosPorOC(orden.state.sub_orders,fechaCompraOc)
      let action = [{
        "type": "Action.Submit",
        "title": "CONFIRMAR",
        "data": [{ "opcionMenu": "confirmar" }, { "reprompt": true }]
      }, {
        "type": "Action.Submit",
        "title": "CANCELAR",
        "data": [{ "opcionMenu": "cancelar" }, { "reprompt": false }]
      }
      ]
      session.userData.flagConfirma = true
      session.send(AdaptiveCard(session, productos, action))
    } else {
      let dataMenu = (session.message.value != undefined) ? session.message.value : session.message.text
      next(datosTextMenu(dataMenu, session))
    }
  },
  async (session, results, args, next) => {
    delete session.userData.flagConfirma
    if (results.resultado.toLowerCase() == 'confirmar' || session.userData.reprompt == true) {

      const msgError = validatePromptsText(botReply.erroresEnCobro_motivo_no_valido, session, 3)
      if (msgError) {
        if (session.userData.retryDialog == 0) {
          builder.Prompts.text(session, botReply.erroresEnCobro_ultimo_poso_describe)
        } else {
          builder.Prompts.text(session, botReply.erroresEnCobro_descripcion_corta)
        }
      }
    } else if (results.resultado.toLowerCase() == 'cancelar' && session.userData.reprompt == false) {
      delete session.userData.reprompt
      session.beginDialog('/end_conversation')
      // session.endConversation()
      // MensajeDeAyuda(session)
    }

  },
  async (session, results, next) => {
    if (results.response.length >= 10) {
      delete session.userData.reprompt
      const objOrdenInfo = await ServClienteOrdenObtener(session.userData.orderNumber)
      const boolMetodoDePago = ('pagoCMR' in objOrdenInfo)
      const strMetodoDePago = (boolMetodoDePago) ? objOrdenInfo.pagoCMR : 'NA'
      const strNivel3 = (strMetodoDePago.toUpperCase() === 'Y') ? 'Error en cobro tarjeta CMR' : 'Error en cobro tarjeta externa'
      const strRutNumero = session.userData.rut.replace('-', '')
      const strRutSinDigito = strRutNumero.slice(0, strRutNumero.length - 1)
      const strDigitoRut = strRutNumero.slice(strRutNumero.length - 1)
      const currentClientInfo = await ServGetClientInfo(strRutNumero)
      const telefono = MetodValidarTelefono.separatePhone({
        response: objOrdenInfo.clienteTelefono
      })
      const {
        ClienteDatosConsultarResp: {
          ListaDeContactosResponse: { Contacto: [contacto] }
        }
      } = currentClientInfo

      const objInfo = {
        ServiceRequest: {
          estadoF12: '',
          nivel1: 'Boletas y Cobros',
          nivel2: 'Errores en cobro',
          nivel3: strNivel3,
          descripcion: `${strNivel3}`,
          numeroOrdenCompra: session.userData.orderNumber
        },
        persona: {
          documento: {
            numero: strRutSinDigito,
            digitoVerificador: strDigitoRut
          },
          nombre: objOrdenInfo.clienteNombre,
          nacionalidad: contacto.nacionalidad,
          apellidoMaterno: null,
          apellidoPaterno: objOrdenInfo.clienteApellido,
          telefono: telefono
        }
      }
      const flagDuplicidadSS = await MetodValidarPorOCDuplicidad(
        strRutNumero,
        session.userData.orderNumber,
        strNivel3
      )
      if (flagDuplicidadSS.length !== 0 && flagDuplicidadSS[0].SsDuplicada) {
        next({ flagDuplicidadSS })
      }
      const objSolicitudServicio = await ServSimpleCreateSS(objInfo)
      next({ response: objSolicitudServicio })
    } else {
      session.userData.retryDialog += 1
      session.replaceDialog('/errores_en_cobros', { reprompt: true })
    }
  },
  (session, results, next) => {
    if ('flagDuplicidadSS' in results) {
      session.beginDialog('/end_conversation', { mensaje: mensajes[0].srDuplicidad.replace('$SSYACREADA', results.flagDuplicidadSS[0].numeroSS) })
      // session.send(mensajes[0].srDuplicidad.replace('$SSYACREADA', results.flagDuplicidadSS[0].numeroSS))
      // MensajeDeAyuda(session)
    } else if ('response' in results && results.response.srNumber) {
      session.beginDialog('/end_conversation', { mensaje: mensajes[0].srExitosa.replace('$SSNumber', results.response.srNumber) })
      // session.send(mensajes[0].srExitosa.replace('$SSNumber', results.response.srNumber))
      // MensajeDeAyuda(session)
    } else {
      session.beginDialog('/end_conversation', { mensaje: mensajes[0].srFallida })
      // session.send(mensajes[0].srFallida)
      // MensajeDeAyuda(session)
    }
  }
])

const mensajes = [{
  srExitosa: 'Lamento esta situación, crearé una solicitud por el problema con el cobro. Para hacer seguimiento, el número de esta solicitud es: $SSNumber. Tu caso es muy importante para nosotros, por eso uno de nuestros ejecutivos trabajará para aclarar esta situación lo antes posible.',
  srFallida: 'Ha ocurrido un inconveniente. Por favor inténtelo nuevamente.',
  srDuplicidad: 'Estimado cliente, ya tienes una solicitud ingresada por cambio de boleta a factura. El número de seguimiento es: $SSYACREADA. Tu caso es muy importante para nosotros es por eso que seguimos gestionando tu requerimiento.'
}]
