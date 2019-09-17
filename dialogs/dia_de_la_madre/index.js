const botReply = require('./text')

bot.dialog('/dia_de_la_madre', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])
