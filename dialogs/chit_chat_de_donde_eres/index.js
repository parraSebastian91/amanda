const botReply = require('./text')

bot.dialog('/chit_chat_de_donde_eres', [
    (session) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])