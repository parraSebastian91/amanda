require('./../datos_reclamo_tipificado')
const botReply = require('./../text')

bot.dialog('/n3_problema_transportista', [
  async (session, args, next) => {
    session.userData.tienda = 'Fono-Compras'
    session.userData.nivel1 = 'Despachos'
    session.userData.nivel2 = 'Problema con el Transportista'
    session.userData.nivel3 = 'Problema con el Transportista'
    session.beginDialog('/datos_reclamo_tipificado',botReply.n3ProblemaTransportista)
  }
])