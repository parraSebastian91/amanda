const botReply = require('./text')
require('./../feedback')

bot.dialog('/preguntas_frecuentes_tottus', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])