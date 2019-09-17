const botReply = require('./text')

bot.dialog('/compra_y_retira_diferentes_tiendas', [
  (session) => {
    const phrase = [botReply.text1]
    const phraseRandom = _.sample(phrase)
    console.log(phraseRandom)
    session.send(phraseRandom)
    session.endDialog()
  }
])