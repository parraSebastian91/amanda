const botReply = require('./text')

bot.dialog('/contacto_servicio_al_cliente', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])