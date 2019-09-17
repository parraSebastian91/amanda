const botReply = require('./text')
bot.dialog('/chit_chat_usuario_aburrido', [
  (session, args, next) => {
        session.send(botReply.text1)
        session.endDialog()
  }
])
