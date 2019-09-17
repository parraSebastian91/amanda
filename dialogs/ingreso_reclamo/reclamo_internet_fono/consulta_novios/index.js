require('./../../reclamo_generico')
//require('./../../../../functions/ingresoDatos/sectionOCEMailReclamo')

const botReply = require('./text')

bot.dialog('/consulta_novios', [
    (session, args, next) => {
        session.userData.nivel2 = 'Compra regalo mal realizada'
        session.userData.nivel3 = 'Compra regalo mal realizada'
        session.beginDialog('/reclamo_generico')
        //session.beginDialog('/sectionOCEMailReclamo')
    },
])