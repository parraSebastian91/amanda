require('./../../functions/ingresoDatos/sectionEndConversation')
const botReply = require('./text')
const { MensajeDeAyuda } = require('./../../utils')

bot.dialog('/inscripcion_club_bebe', [
  (session, args, next) => {
    session.beginDialog('/end_conversation', { mensaje: botReply.text1 })
    // session.send(botReply.text1)
    // MensajeDeAyuda(session)
    // session.endDialog()
  }
])
