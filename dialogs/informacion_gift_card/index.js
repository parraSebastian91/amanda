const botReply = require('./text')
require('./../feedback')

bot.dialog('/informacion_gift_card', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])
