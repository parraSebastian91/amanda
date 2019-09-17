const botReply = require('./text')
require('./../feedback')

bot.dialog('/informacion_viajes_falabella', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
    session.beginDialog('/feedback', { path_origen_feedback: "/informacion_viajes_falabella" })
  }
])