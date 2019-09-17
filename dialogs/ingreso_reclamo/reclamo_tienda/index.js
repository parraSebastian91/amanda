const botReply = require('./text')

bot.dialog('/reclamo_tienda', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.endConversation()
    }
])