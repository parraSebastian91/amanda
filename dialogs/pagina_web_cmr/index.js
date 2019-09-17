const botReply = require('./text')

bot.dialog('/pagina_web_cmr', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])