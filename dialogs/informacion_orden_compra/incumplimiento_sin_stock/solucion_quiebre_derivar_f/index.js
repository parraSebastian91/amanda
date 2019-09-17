require('./../../../../functions/ingresoDatos/sectionEndConversation')
require('./../../../../functions/ingresoDatos/sectionPhone')
//const crypto = require('crypto')
const botReply = require('./../../text')
const {messageDefaultDervPortal, tieneSolicitud} = require('./mensajes')
const { MensajeDeAyuda, transaccionesQuiebres } = require('../../../../utils')
const { CODIGO, SERVICE } = require('../../../../utils/control_errores')
const logger = require('./../../../../utils/logger')
const Fn = require('../../../../utils')
const { SOLICITUD } = require('../../functions')
//const validarFechaSessionActiva = require('./../../../../functions/validaciones/fecha').validarFechaSessionActiva

const armarMensaje = async (subOrdenCreateSS, nivel3) => {
    let botReplyMsg = botReply.messageQuiebre(nivel3)
    let reclamoMsg = {
        mensaje: "",
        success: false
    }
        (subOrdenCreateSS.error.length > 0) ? reclamoMsg = "" : reclamoMsg = botReplyMsg.titulo;
    subOrdenCreateSS.success.forEach(obj => {
        reclamoMsg.mensaje += '<br> &bull; ' + obj.msg
    })
    if (subOrdenCreateSS.error.length > 0) {
        reclamoMsg.mensaje += '<br> No Pudimos registrar la solicitud para el Despacho:'
    }
    subOrdenCreateSS.error.forEach(obj => {
        reclamoMsg.mensaje += '<br> &bull; ' + obj.subOrden + '<br>' + obj.msg
    })
    if (subOrdenCreateSS.success.length > 0) {
        reclamoMsg.mensaje += '<br> ' + botReplyMsg.pie
        reclamoMsg.success = true
    }
    return reclamoMsg
}

// const hasher = async (oc, email) => {
//     let data
//     const hast = crypto.createHash('sha1')
//     let ocMail = oc + email
//     data = hast.update(ocMail, 'utf-8')
//     return data.digest('hex')
// }
bot.dialog('/solucion_quiebre_derivar_f', [
    async (session, args, next) => {
        let nivel3 = 'Incumplimiento Sin Stock'
        let responseLog = {
            listadoSolicitudesOrdenCompra: null,
            existeSSIncumplimientoSinStock: null,
            serv_resp: []
        }
        let mensajeSSObj
        let mensajeEstadoSession = ""
        if (process.env.SEGUIMIENTO_QUIEBRE_ORIGINAL == "true") {
            Fn.MensajeBuscandoInfo(session) //Mensaje Buscango Información
        }
        session.userData.subOrdersArray = []
        try {
            let subOrdenSolicitud = session.userData.solicitudesPendientes[0]
            session.userData.subOrdersArray.push(subOrdenSolicitud.sub_orden)
            let listadoSolicitudesOrdenCompra = session.userData.listadoSolicitudesOrdenCompra
            let arrayListadoSolicitudes = (Fn.ExisteEnObjeto(listadoSolicitudesOrdenCompra, ['SolicitudListadoObtenerOutput', 'SolicitudListadoObtenerResp'])) ? listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener : []
            let existeSSIncumplimiento = await SOLICITUD.existeSSIncumplimientoSinStock(arrayListadoSolicitudes)
            mensajeEstadoSession = await messageDefaultDervPortal(session.userData.orden_compra)          
            logger.info(mensajeEstadoSession)
            session.send(mensajeEstadoSession)
            if (existeSSIncumplimiento && existeSSIncumplimiento.flag_existe_solicitud && existeSSIncumplimiento.numero_solicitud_existente !== '') {
                //tiene SS
                mensajeSSObj = await tieneSolicitud(existeSSIncumplimiento.numero_solicitud_existente)
                let creaFCRQuiebreResult = await SOLICITUD.creaFCRQuiebre(session)
                logger.info(`creaFCRQuiebreResult= ${JSON.stringify(creaFCRQuiebreResult)}`)
            } else {
                //No tiene SS
                // Crea SS incumplimiento_sin_stock               
                let subOrdenCreateSS = await SOLICITUD.creaSSQuiebre(session)
                mensajeSSObj = await armarMensaje(subOrdenCreateSS, nivel3)
                logger.info(`QuiebreResult= ${JSON.stringify(mensaje)}`)
            }         
            if (mensajeSSObj.success) {
                // Solo se envia el mensaje si es exitoso.
                // Se comenta mensaje de creacion de SS y FCR
                //session.send(mensajeSSObj.mensaje)
                logger.info(mensajeSSObj.mensaje)
            } 
            responseLog.listadoSolicitudesOrdenCompra = listadoSolicitudesOrdenCompra
            responseLog.existeSSIncumplimientoSinStock = existeSSIncumplimiento
            responseLog.serv_resp.push(mensajeSSObj)
            responseLog.serv_resp.push(mensajeEstadoSession)
            transaccionesQuiebres(session, {
                name: SERVICE.SOLUCION_QUIEBRE_DERIVAR,
                request: subOrdenSolicitud,
                response: responseLog
            }, CODIGO.SUCCES)
            session.beginDialog('/end_conversation', { mensaje: msg })
            // MensajeDeAyuda(session)
            // session.endConversation()
            session.userData.solicitudesPendientes = []
            session.userData.solicitudesPendientesLength = 1
        } catch (error) {
            logger.error(`Error:/solucion_quiebre_derivar_f; ${error}`)
            session.userData.solicitudesPendientes = []
            session.userData.solicitudesPendientesLength = 1
            transaccionesQuiebres(session, {
                name: SERVICE.SOLUCION_QUIEBRE_DERIVAR,
                request: session.userData,
                response: error
            }, CODIGO.ERROR_APLICACION)
        }
    }
])
