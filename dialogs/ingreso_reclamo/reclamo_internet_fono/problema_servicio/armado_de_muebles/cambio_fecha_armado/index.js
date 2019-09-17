require('./../../../../../../functions/ingresoDatos/sectionArgs')
require('./../../../../../../functions/ingresoDatos/sectionEmail')
require('./../../../../../../functions/ingresoDatos/sectionOC')

const botReply = require('./text')

bot.dialog('/cambio_fecha_armado', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.userData.dialogRetry = 1
        session.beginDialog('/sectionEmail')
    },
    (session, results, next) => {
        session.userData.email = results.response
        session.beginDialog('/sectionArgs')
    },
])