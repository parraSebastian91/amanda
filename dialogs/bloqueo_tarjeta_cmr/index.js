const botReply = require('./text')
require('./../feedback')

bot.dialog('/bloqueo_tarjeta_cmr', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])
