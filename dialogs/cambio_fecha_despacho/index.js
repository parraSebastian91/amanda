const botReply = require('./text')
require('./../feedback')

bot.dialog('/cambio_fecha_despacho', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endConversation()
    session.beginDialog('/feedback', { path_origen_feedback: "/cambio_fecha_despacho", message: session.message.text })
  }
])