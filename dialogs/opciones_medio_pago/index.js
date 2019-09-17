const botReply = require('./text')
require('./../feedback')

bot.dialog('/opciones_medio_pago', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])