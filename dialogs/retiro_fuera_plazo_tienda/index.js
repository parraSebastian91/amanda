const botReply = require('./text')
require('./../feedback')

bot.dialog('/retiro_fuera_plazo_tienda', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])
