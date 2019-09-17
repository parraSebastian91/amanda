const botReply = require('./text')

bot.dialog('/informacion_retiro_tienda', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.send(botReply.text2)
        session.endDialog()
    }
])