require('./../../../../../../functions/ingresoDatos/sectionArgs')
require('./../../../../../../functions/ingresoDatos/sectionEmail')

botReply = require('./../text')

bot.dialog('/inconformidad_post_venta', [
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