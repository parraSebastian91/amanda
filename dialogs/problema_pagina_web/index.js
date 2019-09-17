const botReply = require('./text')

bot.dialog('/problema_pagina_web', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.send(botReply.text2)
        session.endDialog()
    }
])