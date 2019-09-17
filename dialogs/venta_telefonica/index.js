const botReply = require('./text')
require('./../feedback')

bot.dialog('/venta_telefonica', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
    session.beginDialog('/feedback', { path_origen_feedback: "/venta_telefonica" })
  }
])