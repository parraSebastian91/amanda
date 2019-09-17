const botReply = require('./text')
require('./../feedback')

bot.dialog('/anulacion_pendiente', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])