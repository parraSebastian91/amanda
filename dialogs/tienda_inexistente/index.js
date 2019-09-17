const botReply = require('./text')

bot.dialog('/tienda_inexistente', [
    (session, args, next) =>{
        session.send(botReply.text1)
        session.endDialog()
    }
])