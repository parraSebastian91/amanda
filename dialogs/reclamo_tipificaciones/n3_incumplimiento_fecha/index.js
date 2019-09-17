require('./../datos_reclamo_tipificado')
const botReply = require('./../text')

bot.dialog('/n3_incumplimiento_fecha', [
  async (session, args, next) => {
    session.userData.tienda = 'Internet'
    session.userData.nivel1 = 'Despachos'
    session.userData.nivel2 = 'Incumplimiento de fecha'
    session.userData.nivel3 = 'Incumplimiento fecha Entrega'
    session.beginDialog('/datos_reclamo_tipificado',botReply.n3IncumplimientoFecha)
  }
])