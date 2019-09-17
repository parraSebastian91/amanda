
require('./../informacion_tarjeta_cmr')
bot.dialog('/clave_cmr', [
  (session, args, next) => {
    session.beginDialog('/informacion_tarjeta_cmr')
  }
])