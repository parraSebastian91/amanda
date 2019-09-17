const botReply = require('./text')

bot.dialog('/problemas_compra', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])