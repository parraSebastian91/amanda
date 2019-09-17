const botReply = require('./text')

bot.dialog('/chit_chat_chistes', [
  (session) => {
    const phrase = [botReply.text1, botReply.text2, botReply.text3, botReply.text4]
    const phraseRandom = _.sample(phrase)
    console.log(phraseRandom)
    session.send(phraseRandom)
    session.endDialog()
  }
])