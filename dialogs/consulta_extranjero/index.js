const botReply = require('./text')
require('./../feedback')

bot.dialog('/consulta_extranjero', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.endDialog()
        session.beginDialog('/feedback', { path_origen_feedback: "/consulta_extranjero" })
    }
])