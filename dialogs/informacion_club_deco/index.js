const botReply = require('./text')
require('./../feedback')

bot.dialog('/informacion_club_deco', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])