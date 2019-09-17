const botReply = require('./text')
require('./../feedback')

bot.dialog('/sin_respuesta_garantia_extendida', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.send(botReply.text2)
    session.endDialog()
  }
])