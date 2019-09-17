const botReply = require('./text')

bot.dialog('/chit_chat_que_edad_tienes', [
    (session) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])