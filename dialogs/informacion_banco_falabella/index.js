const botReply = require('./text')
require('./../feedback')
require('./../../functions/ingresoDatos/sectionEndConversation')

bot.dialog('/informacion_banco_falabella', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.beginDialog('/end_conversation', { mensaje: botReply.text2 })
        // session.send(botReply.text2)
        // session.endDialog()
    }
])