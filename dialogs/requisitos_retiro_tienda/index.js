const botReply = require('./text')
require('./../feedback')
bot.dialog('/requisitos_retiro_tienda', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])