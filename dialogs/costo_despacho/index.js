const botReply = require('./text')
require('./../feedback')

bot.dialog('/costo_despacho', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])