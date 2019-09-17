const { MensajeDeAyuda } = require('../../utils')
const logger = require('../../utils/logger')
const text = require('./text')
const intentLuis = require("../../functions/salidaDinamica")
require('./callback_quiebre')
require('./giftcard_quiebre')

bot.dialog('/seccionConfirmar', [
    (session, args) => {
        logger.info('inicio - seccionConfirmar')
        session.userData.confirmaPathQuiebre = args.pathQuiebre
        const menuOptions = 'SI|NO'
        const menuText = args.title
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 1,
            retryPrompt:args.titleRetry
        })
    },
    async (session, results, next) => {
        if (!results.resumed) {
            let path = session.userData.confirmaPathQuiebre
            delete session.userData.confirmaPathQuiebre
            let quiebre_on_callback = (process.env.QUIEBRE_ON_CALLBACK == 'true') ? true : false
            switch (results.response.entity) {
                case 'SI':
                    logger.info(`Option SI - seccionConfirmar path:${path}`)
                    session.beginDialog(path)
                    break
                case 'NO':
                if(session.userData.dataPersonal.DatosQuiebre.usuarioVip || !quiebre_on_callback){
                    logger.info('Option NO - seccionConfirmar')
                    session.beginDialog('/callback_quiebre')
                } else {
                    session.beginDialog('/callback_quiebre')
                }
                    break
            }
        } else {
            let resultIntent = await intentLuis.dialogIntent(session)
            session.beginDialog(`/${resultIntent}`)
        }
    }
])