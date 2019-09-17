const botReply = require('./text')

bot.dialog('/chit_chat_como_te_llamas', [
  (session) => {
    const phrase = [botReply.text1, botReply.text2]
    const phraseRandom = _.sample(phrase)
    console.log(phraseRandom)
    session.send(phraseRandom)
    session.endConversation()
    session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
  }
])