const botReply = require('./text')
require('./../feedback')

bot.dialog('/terminar_contrato_cmr', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])
