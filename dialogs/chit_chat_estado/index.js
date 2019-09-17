const botReply = require('./text')

bot.dialog('/chit_chat_estado', [
    (session) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])