require('./clave_web_falabella')
require('./../informacion_banco_falabella')
require('./../clave_cmr')

const botReply = require('./text')
const intentLuis = require("../../functions/salidaDinamica")

bot.dialog('/generico_clave', [
    async (session,next) => {
        const menuOptions = `Clave Banco Falabella|Clave CMR|Clave Web`
        const menuText = '¿A qué clave te refieres?'
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 0
        })
    },
    async (session, results, next) => {
        if (!results.resumed) {
            const textOp = results.response.entity.toLocaleLowerCase().trim()
            switch (textOp) {
                case 'clave banco falabella':
                    session.beginDialog('/informacion_banco_falabella')
                    break
                case 'clave cmr':
                    session.beginDialog('/clave_cmr')
                    break
                case 'clave web':
                    session.beginDialog('/clave_web')
                    break                    
            }
        } else {

            let resultIntent = await intentLuis.dialogIntent(session)
            session.beginDialog(`/${resultIntent}`)

        }
    }
])