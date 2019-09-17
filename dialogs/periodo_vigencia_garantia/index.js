const botReply = require('./text')
require('./../feedback')

bot.dialog('/periodo_vigencia_garantia', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.send(botReply.text2)
    session.send(botReply.text3)
    session.endDialog()
  }
])