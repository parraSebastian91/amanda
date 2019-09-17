bot.dialog('/queja_mal_servicio', [
  (session, args, next) => {
    session.beginDialog('/solicitud_callback')
  }
])
