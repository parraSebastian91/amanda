const botReply = require('./text')

bot.dialog('/puntos_club_bebe', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])
