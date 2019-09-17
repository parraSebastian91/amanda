require('./../../../functions/ingresoDatos/sectionEndConversation')
const botText = require('./../../../bot_text/index')
const { MensajeDeAyuda,transaccionesQuiebres } = require('./../../../utils')
const { CODIGO, SERVICE } = require('../../../utils/control_errores')
const logger = require('../../../utils/logger')
bot.dialog('/quiebre_atendido', [
    async (session, args, next) => {
        try {
            if ('session_userdata' in args) {
                session.userData = args.session_userdata
                session.userData.orderNumber = session.userData.dataPersonal.DatosQuiebre.numeroOrden
                session.userData.rut = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].customer_number_id_oc
                session.userData.orden_compra = session.userData.dataPersonal.DatosQuiebre.numeroOrden
                session.userData.email = session.userData.dataPersonal.DatosQuiebre.emailOrden
                session.userData.statusVIP = session.userData.dataPersonal.DatosQuiebre.usuarioVip
            } else {
                transaccionesQuiebres(session, {
                    name: SERVICE.QUIEBRE_ATENDIDO,
                    request: session.userData,
                    response: null
                }, CODIGO.ERROR_APLICACION_SESSION_EMPTY)
                logger.error('Error controlado: /quiebre_backoffice')
                session.beginDialog('/saludos')
            }
            let msj_porttal = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].message_portal
            let msj_respuesta = (msj_porttal != '' && msj_porttal != null) ? msj_porttal : botText.msj_error_general
            session.send('$$limpiarcookie '+msj_respuesta)
            transaccionesQuiebres(session, {
                name: SERVICE.QUIEBRE_ATENDIDO,
                request: session.userData,
                response: msj_respuesta
            }, CODIGO.SUCCES)
            logger.info(`Quiebre Atendido: ${JSON.stringify(session.userData)}`)
            session.beginDialog('/end_conversation')
            // MensajeDeAyuda(session)
            // session.endConversation()
        } catch (error) {
            transaccionesQuiebres(session, {
                name: SERVICE.QUIEBRE_ATENDIDO,
                request: session.userData,
                response: error
            }, CODIGO.ERROR_APLICACION)
            logger.error(`flujo BO: /quiebre_atendido, ${error}`)
            session.endConversation()
        }
    }
])