const botReply = require('./text')
require('./../feedback')
require('./../../functions/ingresoDatos/sectionEndConversation')

bot.dialog('/informacion_tarjeta_cmr', [
  (session, args, next) => {
    session.beginDialog('/end_conversation', { mensaje: botReply.text1 })
    // session.send(botReply.text1)
    // session.endDialog()
  }
])
