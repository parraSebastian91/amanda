require('./../datos_reclamo_tipificado')
const botReply = require('./../text')

bot.dialog('/n3_error_cobro_tarjeta_externa', [
  async (session, args, next) => {
    session.userData.tienda = 'Internet'
    session.userData.nivel1 = 'Boletas y Cobros'
    session.userData.nivel2 = 'Errores en cobro'
    session.userData.nivel3 = 'Error en cobro tarjeta externa'
    session.beginDialog('/datos_reclamo_tipificado', botReply.n3ErrorCobroTarjetaExterna)
  }
])