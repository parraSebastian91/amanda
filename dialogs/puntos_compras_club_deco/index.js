const botReply = require('./text')

bot.dialog('/puntos_compras_club_deco', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])
