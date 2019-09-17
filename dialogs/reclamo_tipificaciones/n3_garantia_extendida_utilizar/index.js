require('./../datos_reclamo_tipificado')
const botReply = require('./../text')

bot.dialog('/n3_garantia_extendida_utilizar', [
  async (session, args, next) => {
    session.userData.tienda = 'Internet'
    session.userData.nivel1 = 'Prod, Servicios y Gift Card'
    session.userData.nivel2 = 'Garantía Extendida'
    session.userData.nivel3 = 'Solicitud Uso Garantía Ext'
    session.userData.SolicitudGaratiaExtendida = true;
    session.beginDialog('/datos_reclamo_tipificado',botReply.n3GarantiaExtendidaUtilizar)
  }
])