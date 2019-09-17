require('./../../functions/saludos')

bot.dialog('/chit_chat_saludo', [
  (session, args, next) => {
    session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
  }
])