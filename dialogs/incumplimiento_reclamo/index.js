const botReply = require('./text')
require('./../feedback')

bot.dialog('/incumplimiento_reclamo', [
  (session, args, next) => {
    session.send(botReply.text1)
  }
])