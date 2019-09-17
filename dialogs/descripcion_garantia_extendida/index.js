const botReply = require('./text')
require('./../feedback')

bot.dialog('/descripcion_garantia_extendida', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.send(botReply.text2)
    session.endDialog()
  }
])