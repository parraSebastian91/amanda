//const builder = require('botbuilder')
const logger = require('./../../../utils/logger')
const { CODIGO, SERVICE } = require('./../../../utils/control_errores')
const { transaccionesQuiebres } = require('./../../../utils')

bot.dialog('/solucion_callback', [
    (session, args, next) => {
        logger.info('Dialogo:solucion_callback.')
        const menuOptions = `SI|NO`
        const menuText = '¿Deseas que te contacte un ejecutivo?'
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 0
        })
    },
    async(session, results, next) => {
        if (!results.resumed) {
            if (results.response.entity && results.response.entity == 'SI') {
                let _info
                if (typeof session.userData.callbackSS && session.userData.callbackSS != null) {
                    _info = {
                        rut: session.userData.rut,
                        phone: session.userData.telefonoCallback,
                        nombreCtc: 'Amanda Quiebres',
                        apellidoCtc: '',
                        ss: session.userData.callbackSS,
                        mailCh: ''
                    }
                }
                let responseCallbackService = await GENESYS.getClienteLlamadaSolicitar(_info, 'FALABELLA_SAC_BO_CH', 'Reincidencias')
                if (responseCallbackService) {
                    try {
                        if (responseCallbackService.response.Body.clienteLlamadaSolicitarExpResp.respMensaje.codigoMensaje == 1) {

                            transaccionesQuiebres(session, {
                                name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_REINCIDENCIAS,
                                request: { _info, FALABELLA_SAC_BO_CH, Reincidencias },
                                response: responseCallbackService
                            }, CODIGO.SUCCES)


                            session.userData.callbackExist = true
                            session.endConversation('Un ejecutivo se contactará contigo a la brevedad.')
                        } else {

                            transaccionesQuiebres(session, {
                                name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_REINCIDENCIAS,
                                request: { _info, FALABELLA_SAC_BO_CH, Reincidencias },
                                response: responseCallbackService
                            }, CODIGO.ERROR_SERVICIO)
                            logger.error(`/callback_reincidencias`)

                            session.endConversation('Ha ocurrido un inconveniente. Por favor inténtelo nuevamente.')
                        }
                    } catch (e) {
                        logger.error(`Ha ocurrido un inconveniente. Por favor inténtelo nuevamente. ${JSON.stringify(e)}`)
                        session.endConversation('Ha ocurrido un inconveniente. Por favor inténtelo nuevamente.')
                    }
                } else {
                    session.endConversation('Ha ocurrido un inconveniente. Por favor inténtelo nuevamente.')
                }
            } else {
                session.endConversation()
            }
        } else {
            session.endConversation()
        }
    }
])