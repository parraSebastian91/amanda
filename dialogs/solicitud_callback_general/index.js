require('./../../__services/genesys')
require('./../../functions/ingresoDatos/sectionPhone')
const moment = require('moment')
const botReply = require('./text')
const { CODIGO, SERVICE } = require('./../../utils/control_errores')
const { transaccionesQuiebres } = require('../../utils')

bot.dialog('/solicitud_callback_general', [
    async(session, args, next) => {
        // Validamos si pasamos argumentos al dialogo con el valor descripcion_negocio
        if (args && args.descripcion_negocio) {
            session.dialogData.descripcion_negocio = args.descripcion_negocio
        } else {
            session.dialogData.descripcion_negocio = 'Falabella_SAC_CH'
        }

        let flagFlechaBloqueadaCallback = await GENESYS.validarBloqueoDiaCallback(session.dialogData.descripcion_negocio)
        if (!flagFlechaBloqueadaCallback) {
            if (moment().hours() >= 9 && moment().hours() < 21) {
                session.send(botReply.text4)
                session.beginDialog('/sectionPhone')
            } else {
                session.endConversation(botReply.text1)
            }
        } else {
            session.endConversation(botReply.text3)
        }
    },
    async(session, results, next) => {
        const info = {
            rut: '0-0',
            phone: session.userData.telefono,
            nombreCtc: 'Amanda Atención Cliente',
            apellidoCtc: '',
            mailCh: ''
        }

        if ((typeof session.userData.callback_backoffice != 'undefined' && session.userData.callback_backoffice == 1) || (typeof session.userData.ssCallback != 'undefined' && session.userData.ssCallback == 1))
            var respuesta = await GENESYS.getClienteLlamadaSolicitar(info, session.dialogData.descripcion_negocio)
        else
            var respuesta = await GENESYS.getClienteLlamadaSolicitar(info)

        if (respuesta.response.Body.clienteLlamadaSolicitarExpResp.respMensaje.codigoMensaje == 1) {

            transaccionesQuiebres(session, {
                name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_GENERAL,
                request: { info },
                response: respuesta
            }, CODIGO.SUCCES)

        } else {

            transaccionesQuiebres(session, {
                name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_GENERAL,
                request: { info },
                response: respuesta
            }, CODIGO.ERROR_SERVICIO)
            logger.error(`/callback_general`)

        }

        session.endConversation(botReply.text2)
    }
])