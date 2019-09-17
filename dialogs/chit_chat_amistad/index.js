const botReply = require('./text')

bot.dialog('/chit_chat_amistad', [
    (session) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])