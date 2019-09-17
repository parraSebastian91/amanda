const botReply = require('./text')
require('./../feedback')

bot.dialog('/registro_web_falabella', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])
