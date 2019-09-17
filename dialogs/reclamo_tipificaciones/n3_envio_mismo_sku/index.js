require('./../datos_reclamo_tipificado')
const botReply = require('./../text')

bot.dialog('/n3_envio_mismo_sku', [
  async (session, args, next) => {
    session.userData.tienda = 'Internet'
    session.userData.nivel1 = 'Despachos'
    session.userData.nivel2 = 'Falta producto en despacho'
    session.userData.nivel3 = 'Envío de mismo SKU'
    session.beginDialog('/datos_reclamo_tipificado',botReply.ten3EnvioMismoSkuxt2)
  }
])