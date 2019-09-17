const botReply = require('./text')
require('./../feedback')

bot.dialog('/actualizacion_datos_cmr', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])
