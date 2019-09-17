const botReply = require('./text')
require('./../feedback')

bot.dialog('/consulta_extranjero_despacho', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])