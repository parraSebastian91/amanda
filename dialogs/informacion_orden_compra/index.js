require('./../../functions/ingresoDatos/sectionEndConversation')
require('./../../functions/ingresoDatos/sectionEmail')
require('./../../functions/ingresoDatos/sectionRun')
require('./../../functions/ingresoDatos/sectionPhone')
require('./../../functions/ingresoDatos/sectionOCValidadorPalabras')
require('./enrutador')
const { TIPOLOGIA } = require('./functions')
const { validacionRutMailPorOC } = require('./../../functions/validaciones/validaRutMailEnOC')
const { limpiaSession, MensajeDeAyuda, MensajeBuscandoInfo } = require('../../utils')
const validarFechaSessionActiva = require('./../../functions/validaciones/fecha').validarFechaSessionActiva
const logger = require('./../../utils/logger')
const text = require('./text')

/**
 * Dialogo informacion_orden_compra
 * @author: Front
 * @version: 2.0.0
 */
bot.dialog('/informacion_orden_compra', [
  async (session, args, next) => {
    logger.info('Inicio, dialogo: informacion_orden_compra ')
    limpiaSession(session)
    // session.send(botReply.text21)
    session.send(text.inicioSeguimientoOC)
    session.userData.dialogRetryOC = 1
    session.beginDialog('/sectionOCValidadorPalabras')
  },
  async (session, results, next) => {
    if (!validarFechaSessionActiva(session.userData)) {
      // if (!session.userData.dataProgram.sessionActiva) {
      session.userData.orden_compra = results.response
      session.userData.dialogRetry = 1
      session.beginDialog('/sectionEmail')
    } else {
      session.userData.email = session.userData.dataPersonal.emailUsuario
      session.userData.rut = session.userData.dataPersonal.rutUsuario
      next({ 'response': session.userData.email })
    }
  },
  async (session, results, next) => {
    try {
      session.userData.email = results.response
      const datosCliente = await validacionRutMailPorOC(session.userData, false)
      if (!datosCliente.datosOK) {
        session.beginDialog('/end_conversation', { mensaje: datosCliente.mensaje })
        // session.send(datosCliente.mensaje)
        // MensajeDeAyuda(session)
        // session.endConversation()
      } else {
        MensajeBuscandoInfo(session) // Mensaje Buscando Informacion 
        session.userData.rut = datosCliente.rutOC.replace(/[^\w]/g, '')
        session.userData.telefono = datosCliente.telefonoOc
        session.userData.rutCompraValida = datosCliente.rutCompraValidaOC.replace(/[^\w]/g, '')
        next()
      }
    } catch (error) {
      logger.error(`Error:/informacion_orden_compra-validacionRutMailEnOC; ${error}`)
    }
  },
  async (session, results, next) => {
    try {
      // session.userData.rut = ''
      // session.userData.orderNumber = ''
      // session.userData.email = ''
      session.userData.dataProgram.ServiceOn = true // impide que el mensaje ingresado por usuario genere actividad dentro del BOT
      session.userData.solucionesPendientes = []
      session.userData.state = ''
      session.userData.solicitudesPendientesLength = 1
      session.userData.orden_compra = session.userData.orderNumber
      session.userData.currentClientInfo = await new Promise(
        (resolve, reject) => {
          resolve(SIEBEL.getClientInfo(session.userData.rut))
        }
      )
      const listadoSolicitudesOrdenCompra = await SIEBEL.solicitudListadoObtener(session.userData.orderNumber)
      session.userData.listadoSolicitudesOrdenCompra = []
      if (listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp != null &&
        listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp !== undefined) {
        session.userData.listadoSolicitudesOrdenCompra = listadoSolicitudesOrdenCompra
      }
      let webTrackingProcess = await TIPOLOGIA.webtrackingProcess(session)
      // Validar en web traking el error
      if (webTrackingProcess.sub_orders_procesadas && webTrackingProcess.sub_orders_procesadas.length > 0) {
        logger.info('dialogo: informacion_orden_compra, webTrackingProcess.sub_orders_procesadas.length > 0')
        let sub_orders_procesadas = await TIPOLOGIA.ordenarSubOrdenesPorPrioridad(webTrackingProcess.sub_orders_procesadas)
        session.userData.tienda = 'Internet'
        session.userData.state = webTrackingProcess.state
        session.userData.solicitudesPendientes = sub_orders_procesadas
        session.userData.fechaCompra = webTrackingProcess.state.created_date
        session.userData.idTicket = webTrackingProcess.state.ticket_id
        session.userData.ticketSequence = webTrackingProcess.state.ticket_sequence
        session.userData.ticketTerminal = webTrackingProcess.state.ticket_terminal
        // ----------------- Datos para Anulacion en Quiebre ---------------
        session.userData.totalSubOrdenes = sub_orders_procesadas.length
        session.userData.numSubOrdenesProductosConQuiebre = await TIPOLOGIA.getCantidadSolQuiebre(session.userData.solicitudesPendientes)
        // ----------------- Datos para Anulacion en Quiebre ---------------
        // ###############################
        session.userData.order = {
          order: webTrackingProcess.state,
          itemsSelected: null
        }// Codigo viejo para las fcr
        // #############################
        session.beginDialog('/enrutador')
      } else {
        logger.error('dialogo: informacion_orden_compra, webTrackingProcess()')
        throw new Error('/informacion_orden_compra: webTrackingProcess()')
      }
    } catch (error) {
      logger.error(`Error:/informacion_orden_compra; ${error}`)
      session.userData.solicitudesPendientesLength = 1
      session.userData.solicitudesPendientes = []
      session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      session.endConversation()
      // return
    }
  }
])
