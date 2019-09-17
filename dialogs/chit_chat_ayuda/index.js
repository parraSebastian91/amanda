const botReply = require('./text')

bot.dialog('/chit_chat_ayuda', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])