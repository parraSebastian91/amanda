const botReply = require('./text')

bot.dialog('/no_me_sirve', [
  (session, args, next) => {
    session.send(botReply.text)
    next()
  },
  async (session, results, next) => {
    session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
  }
])