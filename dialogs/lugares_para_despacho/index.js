const botReply = require('./text')
require('./../feedback')

bot.dialog('/lugares_para_despacho', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])