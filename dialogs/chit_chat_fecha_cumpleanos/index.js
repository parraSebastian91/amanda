const botReply = require('./text')

bot.dialog('/chit_chat_fecha_cumpleanos', [
    (session) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])