const botReply = require('./text')

bot.dialog('/chit_chat_eres_real', [
    (session) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])