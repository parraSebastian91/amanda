const botReply = require('./text')
require('./../feedback')

bot.dialog('/informacion_club_novios', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])
