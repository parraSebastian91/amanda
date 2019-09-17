const botReply = require('./text')
require('./../feedback')

bot.dialog('/puntos_cmr', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
    session.beginDialog('/feedback', { path_origen_feedback: "/puntos_cmr" })
  }
])
