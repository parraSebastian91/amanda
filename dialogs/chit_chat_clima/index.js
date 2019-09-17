const botReply = require('./text')

bot.dialog('/chit_chat_clima', [
  (session) => {
    session.send(botReply.text1)

    session.endConversation()
    session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
  }
])