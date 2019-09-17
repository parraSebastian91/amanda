require('./solucion_quiebre_producto')
require('./solucion_quiebre_derivar_f')
require('./../enrutador')
require('./../solicitudRutTelefono')
const validarFechaSessionActiva = require('./../../../functions/validaciones/fecha').validarFechaSessionActiva
const { TIPOLOGIA, SOLICITUD } = require('../functions')
const botReply = require('./../text')
const logger = require('./../../../utils/logger')
const Fn = require('../../../utils')



bot.dialog('/incumplimiento_sin_stock', [
  async (session, args, next) => {
    logger.info('Dialogo: incumplimiento_sin_stock')
    if (!validarFechaSessionActiva(session.userData) && process.env.SEGUIMIENTO_QUIEBRE_ORIGINAL == "true") {
      delete session.userData.rut
      delete session.userData.telefono
      session.beginDialog('/solicitudRutTelefonoUsuario')
    } else {
      next()
    }
  },
  async (session, args, next) => {
    // let quiebbreBo = await getSsDatoQuiebre(session.userData.orden_compra, true)
    if (process.env.SEGUIMIENTO_QUIEBRE_ORIGINAL == "true") {
      logger.info('Quiebre flujo normal')
      next()
    } else {
      //validar flujo quiebre nuevo
      logger.info('Quiebre flujo solucion_quiebre_derivar_f')
      session.beginDialog('/solucion_quiebre_derivar_f')
    }
  },
  async (session, args, next) => {
    try {
      Fn.MensajeBuscandoInfo(session) //Mensaje Buscango Información
      session.userData.subOrdersArray = []
      let subOrdenSolicitud = session.userData.solicitudesPendientes[0]
      session.userData.subOrdersArray.push(subOrdenSolicitud.sub_orden)
      let listadoSolicitudesOrdenCompra = session.userData.listadoSolicitudesOrdenCompra
      let arrayListadoSolicitudes = (Fn.ExisteEnObjeto(listadoSolicitudesOrdenCompra, ['SolicitudListadoObtenerOutput', 'SolicitudListadoObtenerResp'])) ? listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener : []
      let existeSSIncumplimiento = await SOLICITUD.existeSSIncumplimientoSinStock(arrayListadoSolicitudes)
      if (existeSSIncumplimiento && existeSSIncumplimiento.flag_existe_solicitud && existeSSIncumplimiento.numero_solicitud_existente !== '') {
        // if (flag_existe_solicitud && numero_solicitud_existente != "") {
        // session.userData.solicitudQuiebre = solicitud
        session.userData.solicitudQuiebre = existeSSIncumplimiento.solicitudQuiebre
        const solicitudExistenteDetalleObtener = await SIEBEL.solicitudDetalleObtener(existeSSIncumplimiento.numero_solicitud_existente)
        if (Fn.ExisteEnObjeto(solicitudExistenteDetalleObtener, ['SolicitudDetalleObtenerOutput', 'SolicitudDetalleObtenerResp', 'SolicitudDetalleObtener', 'ListaDeActividades'])) {
          let crea_duplicada_actividad = SOLICITUD.validarActividadQuiebre(solicitudExistenteDetalleObtener, 'Gestión de Anulación')
          let creaFCRQuiebreResult = await SOLICITUD.creaFCRQuiebre(session)
          logger.info(`creaFCRQuiebreResult= ${JSON.stringify(creaFCRQuiebreResult)}`)
          if (crea_duplicada_actividad === true) {
            // if (!flag_no_contacto_cliente) {
            const actividadEnCurso = SOLICITUD.actividadesEnCurso(solicitudExistenteDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.ListaDeActividades.Actividades)
            if (actividadEnCurso) {
              session.beginDialog('/solucion_quiebre_producto')
            } else {
              session.send(`Estimado Cliente, un ejecutivo especializado se encuentra gestionando tu caso para darte una pronta solución. Puedes realizar el seguimiento de tu solicitud con el siguiente número: ${session.userData.numeroSSFCR}`)
            }
            // session.endConversation()
          } else {
            session.send(`Estimado cliente, ya tienes una solicitud ingresada por inconvenientes con tu compra, el número de seguimiento es: ${session.userData.numeroSSFCR}. Un ejecutivo se encuentra trabajando en tu caso para darte una pronta solución`)
            next()
          }
        } else {
          // console.log('Error en el servicio: solicitudDetalleObtener; ')
          logger.error('Error en el servicio: solicitudDetalleObtener;')
        }
      }
      else {
        // Crea SS incumplimiento_sin_stock
        const armarMensaje = async (subOrdenCreateSS, nivel3) => {
          let botReplyMsg = botReply.messageQuiebre(nivel3)
          let reclamoMsg = botReplyMsg.titulo
          subOrdenCreateSS.success.forEach(obj => {
            reclamoMsg += '<br> &bull; ' + obj.msg
          })
          if (subOrdenCreateSS.error.length > 0) {
            reclamoMsg += '<br> No Pudimos registrar la solicitud para el Despacho:'
          }
          subOrdenCreateSS.error.forEach(obj => {
            reclamoMsg += '<br> &bull; ' + obj.subOrden + '<br>' + obj.msg
          })
          if (subOrdenCreateSS.success.length > 0) {
            reclamoMsg += '<br> ' + botReplyMsg.pie
            reclamoMsg += '<br> ' + botReplyMsg.correo.replace('{{correo}}', FN.OfuscarCorreo(session.userData.email))
          }
          return reclamoMsg
        }
        let subOrdenCreateSS = await SOLICITUD.creaSSQuiebre(session)
        let nivel3 = 'Incumplimiento Sin Stock'
        let mensaje = await armarMensaje(subOrdenCreateSS, nivel3)
        logger.info(`QuiebreResult= ${JSON.stringify(mensaje)}`)
        session.send(mensaje)
        next()
      }
    } catch (error) {
      // console.log(`Error:/incumplimiento_sin_stock; ${error}`)
      logger.error(`Dialogo:/incumplimiento_sin_stock; ${JSON.stringify(error)}`)
      session.userData.solicitudesPendientesLength = 1
      session.userData.solicitudesPendientes = []
      session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      session.endConversation()
    }
  },
  async (session, args, next) => {
    try {
      session.userData.solicitudesPendientes = await TIPOLOGIA.removeElementArray(session.userData.solicitudesPendientes)
      if (session.userData.solicitudesPendientes.length > 0) {
        session.beginDialog('/enrutador')
      } else {
        session.endConversation()
        return
      }
    } catch (error) {
      // console.log(`Error:/incumplimiento_sin_stock; ${error}`)
      session.userData.solicitudesPendientesLength = 1
      session.userData.solicitudesPendientes = []
      logger.error(`Dialogo:/incumplimiento_sin_stock; ${JSON.stringify(error)}`)
      session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      session.endConversation()
    }
  }
])
