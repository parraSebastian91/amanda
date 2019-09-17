require('./../datos_reclamo_tipificado')
const botReply = require('./../text')

bot.dialog('/n3_garantia_extendida_anulacion', [
  async (session, args, next) => {
    session.userData.tienda = 'Internet'
    session.userData.nivel1 = 'Boletas y Cobros'
    session.userData.nivel2 = 'Anulación de compra parcial'
    session.userData.nivel3 = 'Anulación de compra parcial'
    session.userData.AnulacionGaratiaExtendida = true;
    session.beginDialog('/datos_reclamo_tipificado',botReply.n3GarantiaExtendidaAnulacion)
  }
])