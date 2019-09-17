const botReply = require('./text')

bot.dialog('/getsurvey', [
  (session, args, next) => {
    session.userData.retryEncuesta = false;
    session.send(botReply.text1)
    session.endDialog()
  }
])