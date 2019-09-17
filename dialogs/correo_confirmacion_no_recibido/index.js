const botReply = require('./text')
require('./../feedback')

bot.dialog('/correo_confirmacion_no_recibido', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])