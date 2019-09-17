bot.dialog('/sernac_reclamo', [
  (session, args, next) => {
    session.beginDialog('/solicitud_callback')
  }
])
