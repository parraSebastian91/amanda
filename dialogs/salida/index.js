bot.dialog('/salida', [
  (session, args, next) => {
    builder.Prompts.choice(session, '¿Deseas salir de esta sección?', 'SI|NO', {
      listStyle: builder.ListStyle.button
    })
  },
  (session, results, next) => {

    if (results.response.entity === 'NO') {
      session.replaceDialog(session.userData.sectionSalida)
    } else {
      session.endConversation()
      session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
    }
  }
])