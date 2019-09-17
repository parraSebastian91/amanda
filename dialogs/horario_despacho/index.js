const botReply = require('./text')
require('./../feedback')

bot.dialog('/horario_despacho', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])