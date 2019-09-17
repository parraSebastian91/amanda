const botReply = require('./text')
require('./../feedback')

bot.dialog('/plazo_retiro_tienda', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.send(botReply.text2)
    session.endDialog()
  }
])