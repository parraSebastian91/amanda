const botReply = require('./text')
require('./../feedback')

bot.dialog('/preguntas_frecuentes_sodimac', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])