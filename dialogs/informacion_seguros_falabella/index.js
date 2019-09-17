const botReply = require('./text')
require('./../feedback')

bot.dialog('/informacion_seguros_falabella', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])