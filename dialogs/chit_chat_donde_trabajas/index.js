const botReply = require('./text')

bot.dialog('/chit_chat_donde_trabajas', [
    (session) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])