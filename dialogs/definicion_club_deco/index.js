const botReply = require('./text')

bot.dialog('/definicion_club_deco', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])