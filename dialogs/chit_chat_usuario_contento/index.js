const botReply = require('./text')
bot.dialog('/chit_chat_usuario_contento', [
  (session, args, next) => {
       const phrase = [botReply.text1, botReply.text2]
        const phraseRandom = _.sample(phrase)
        console.log(phraseRandom)
        session.send(phraseRandom)
        session.endDialog()
  }
])
