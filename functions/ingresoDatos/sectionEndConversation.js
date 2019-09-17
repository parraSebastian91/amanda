
const { consultarLuis } = require('./../../utils')
const logger = require('./../../utils/logger')
// Homologacion 20/08/2019
bot.dialog('/end_conversation', [
    (session, args, next) => {
        logger.info('Ingreso a /end_conversation')
        session.userData.dataProgram.ServiceOn = false
        if (args) {
            logger.info('args : mensaje' + args.mensaje)
            session.send(args.mensaje)
        } else {
            logger.info('args : undefined')
        }
        delete session.userData.email
        delete session.userData.orden_compra
        delete session.userData.orderNumber
        next()
    },
    async (session, args, next) => {        
        setTimeout(() => builder.Prompts.text(session, '¿En qué más te puedo ayudar?'), 3000)        
    },
    async (session, args, next) => {
        var result = await consultarLuis(args.response)
        var cobro_tarjeta_externa = 'n3_error_cobro_tarjeta_externa';
        var cobro_tarjeta_cmr = 'n3_error_cobro_tarjeta_cmr';
        if (
            cobro_tarjeta_externa === result.toLowerCase() ||
            cobro_tarjeta_cmr === result.toLowerCase()
        ) {
            session.beginDialog('/none');
        } else {
            session.beginDialog(`/${result.toLowerCase()}`);
        }
    }
])
