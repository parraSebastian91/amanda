const botReply = require('./text')

bot.dialog('/callback_no_realizado', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])