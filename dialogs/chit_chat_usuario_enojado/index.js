const botReply = require('./text')
bot.dialog('/chit_chat_usuario_enojado', [
  (session, args, next) => {
    const phrase = [botReply.text1, botReply.text2]
    const phraseRandom = _.sample(phrase)
    session.send(phraseRandom)
    session.endDialog()
  }
])
