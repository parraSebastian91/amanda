// *****************************************************************
// *                        Solo para reclamos                     *
// *****************************************************************
// const builder = require('botbuilder')
// require('./sectionFormularioCambioBoleta')
// const botReply = require('./text')
// const moment = require('moment')
require('./sectionEndConversation')
const mensajesCreacionSSTipologiaNivel3 = require('./mensajesCreacionSSTipologiaNivel3.json')
const { MensajeDeAyuda, limpiaSession, transaccionesQuiebres, AdaptiveCard, OfuscarCorreo } = require('../../utils')
const { TIPOLOGIA, SOLICITUD, TIPO_SOLICITUD } = require('./../../dialogs/informacion_orden_compra/functions')
const tieneIncumplimientoFechaArray = TIPOLOGIA.tieneIncumplimientoFechaArray
const tieneTotalEntregaFalsoArray = TIPOLOGIA.tieneTotalEntregaFalsoArray
const agregarEstadoSolPendiente = TIPOLOGIA.agregarEstadoSolPendiente
const existeSolicitudPendiente = TIPOLOGIA.existeSolicitudPendiente
const logger = require('./../../utils/logger')
const { mostrarProducto } = require('../../utils/seguimiento')
const botReply = require('./text')

const MENSAJE_CORREO = 'Te hemos enviado un respaldo de tu solicitud al correo: {{correo}}'

async function recordatorioGift(session) {

  const url = 'https://chatbotstorageblob.blob.core.windows.net/assets/img/consulta_solicitud.gif'
  const body = [
    {
      'type': 'ColumnSet',
      'columns': [
        {
          'type': 'Column',
          'width': 'auto',
          'items': [
            {
              "type": "TextBlock",
              "text": "Recuerda que puedes realizar el seguimiento de tu caso ingresando en Amanda; Botón Servicios Postventa --> Consulta Solicitud"
            },
            {
              'type': 'Image',
              'url': url
            }
          ]
        }
      ]
    }
  ]
  const action = [
    {
      'type': 'Action.OpenUrl',
      'id': 'ampliar-imagen',
      'title': 'Ampliar imagen',
      'url': url
    }
  ]
  return AdaptiveCard(session, body, action)
}
bot.dialog('/sectionArgsIncumplientoFecha', [
  async function (session, args, next) {
    try {
      session.userData.solicitudesPendientes = []
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
      let sub_orders_procesadas
      if (webTrackingProcess.sub_orders_procesadas && webTrackingProcess.sub_orders_procesadas.length > 0) {
        logger.info('dialogo: informacion_orden_compra, webTrackingProcess.sub_orders_procesadas.length > 0')
        sub_orders_procesadas = await TIPOLOGIA.ordenarSubOrdenesPorPrioridad(webTrackingProcess.sub_orders_procesadas)
        session.userData.tienda = 'Internet'
        session.userData.state = webTrackingProcess.state
        session.userData.solicitudesPendientes = sub_orders_procesadas
        session.userData.fechaCompra = webTrackingProcess.state.created_date
        session.userData.idTicket = webTrackingProcess.state.ticket_id
        session.userData.ticketSequence = webTrackingProcess.state.ticket_sequence
        session.userData.ticketTerminal = webTrackingProcess.state.ticket_terminal
        // ###############################
        session.userData.order = {
          order: webTrackingProcess.state,
          itemsSelected: null
        }// Codigo viejo para las fcr
        // #############################
        let solicitudesPendientes = sub_orders_procesadas
        const solicitudesPendientesConIncumplimiento = tieneIncumplimientoFechaArray(solicitudesPendientes)
        const solicitudesPendientesPosibleTotalEntrega = tieneTotalEntregaFalsoArray(solicitudesPendientes)
        let incumplimientoFecha = existeSolicitudPendiente(solicitudesPendientes, TIPO_SOLICITUD.INCUMPLIMIENTO_FECHA)
        let reagendamientoConIncumplimiento = existeSolicitudPendiente(solicitudesPendientes, TIPO_SOLICITUD.REAGENDAMIENTO_CON_INCUMPLIMIENTO)
        let listoRetiroTiendas = existeSolicitudPendiente(solicitudesPendientes, TIPO_SOLICITUD.LISTO_RETIRO_TIENDAS)
        let totalEntregaFalso = existeSolicitudPendiente(solicitudesPendientes, TIPO_SOLICITUD.TOTAL_ENTREGA_FALSO)
        if (reagendamientoConIncumplimiento) {
          // session.userData.subOrderIncReagendamientoArray = TIPOLOGIA.filtrarSolConIncReagendamiento(solicitudesPendientes)
          session.userData.subOrderIncReagendamientoArray = TIPOLOGIA.filtrarSolicitudesArray(solicitudesPendientes, TIPO_SOLICITUD.REAGENDAMIENTO_CON_INCUMPLIMIENTO)
          let infoIncReagendamiento = await SOLICITUD.createSsFcrReagendamiendo(session)
          session.userData.solicitudesPendientes = agregarEstadoSolPendiente(solicitudesPendientes, infoIncReagendamiento)
        }
        if (listoRetiroTiendas) {
          logger.info('Dialogo:enrutador - Listo para retiro tiendas')
          session.userData.arraySubOrdenesConRetiroPendiente = solicitudesPendientes
            .filter((i) => i.dialogo === TIPO_SOLICITUD.LISTO_RETIRO_TIENDAS)
            .map((i) => i.sub_orden)
          let listoRetiroTiendas = await SOLICITUD.fcrDeConsultaPorIngresoReclamo(session, false)
          session.userData.solicitudesPendientes = agregarEstadoSolPendiente(solicitudesPendientes, listoRetiroTiendas)
        }
        if (solicitudesPendientesConIncumplimiento.length > 0) {
          session.userData.solicitudesPendientesConIncumplimiento = solicitudesPendientesConIncumplimiento
          let infoIncumplimientoFecha = await SOLICITUD.createSSFCRIncumplimientoFecha(session)
          if (infoIncumplimientoFecha !== null) {
            session.userData.solicitudesPendientes = agregarEstadoSolPendiente(solicitudesPendientes, infoIncumplimientoFecha)
          }
        }
        let productosBody = mostrarProducto(session.userData.solicitudesPendientes, false)
        session.send(AdaptiveCard(session, productosBody))
        let mensajeSsCreada = ''
        let mensajeNoCreadaSS = ''
        if (solicitudesPendientesPosibleTotalEntrega.length > 0) {
          session.userData.solicitudesPendientesPosibleTotalEntrega = solicitudesPendientesPosibleTotalEntrega
          let posibleTotalEntrega = await SOLICITUD.createSSFCRPosilibleTotalEntregaF(session)
          session.userData.solicitudesPendientes = agregarEstadoSolPendiente(solicitudesPendientes, posibleTotalEntrega)

          if (posibleTotalEntrega !== null) {
            let ssReclamoCreado = ''
            posibleTotalEntrega.success.forEach(obj => {
              ssReclamoCreado = (posibleTotalEntrega.success.length === 1) ? '<br>&bull;' + obj.msg + '.' : ssReclamoCreado + '<br> &bull;' + obj.msg + '.'
            })
            if (posibleTotalEntrega.success.length > 0) {
              var msgIncumplimientoF = mensajesCreacionSSTipologiaNivel3.find(function (e) {
                return e.tipologia === 'Incumplimiento fecha Entrega'
              })
              mensajeSsCreada += '&bull;' + msgIncumplimientoF.mensaje.replace('$ID_SOLICITUD', ssReclamoCreado) + '.'
            }
            posibleTotalEntrega.error.forEach(obj => {
              ssReclamoNoCreado = (posibleTotalEntrega.error.length === 1) ? '<br>&bull;&nbsp;' + obj.subOrden + '.' : ssReclamoNoCreado + '<br> &bull;' + obj.msg + '.'
            })
            if (posibleTotalEntrega.error.length > 0) {

              if (posibleTotalEntrega.error.length === 1) {
                mensajeNoCreadaSS = botReply.sectionArgs_no_registra_ss + ssReclamoNoCreado + '<br>' + posibleTotalEntrega.error[0].msg
              } else {
                mensajeNoCreadaSS = botReply.sectionArgs_no_registra_varias_ss.replace('$SSRECLAMONOCREADO', ssReclamoNoCreado)
              }
            }

          }
        }
        if (mensajeSsCreada != "") {
          mensajeSsCreada += '<br>' + MENSAJE_CORREO.replace('{{correo}}', OfuscarCorreo(session.userData.email)) + '.'
          session.send(mensajeSsCreada)
          if (session.userData.ingresoPor == 'Ingreso Solicitud') {
            let gift = await recordatorioGift(session)
            session.send(gift)
          }

        } else if (mensajeNoCreadaSS != '') {
          session.send(mensajeNoCreadaSS)
        }
        if (!reagendamientoConIncumplimiento && !listoRetiroTiendas && !incumplimientoFecha && !totalEntregaFalso) {
          SOLICITUD.fcrDeConsultaPorIngresoReclamo(session, true)
        }
      }
    } catch (error) {
      session.userData.solicitudesPendientes = []
      logger.error(error)
    }
    next()
  },
  async (session, results, next) => {
    session.userData.solicitudesPendientes = []
    limpiaSession(session)
    session.beginDialog('/end_conversation')
    // MensajeDeAyuda(session)
    // session.endConversation()
  }
])