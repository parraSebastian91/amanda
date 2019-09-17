require('./../../ingreso_reclamo/reclamo_generico')
require('./../../../functions/ingresoDatos/sectionPhone')
require('./../../../functions/ingresoDatos/sectionRun')
const botReply = require('./text')

bot.dialog('/cambio_fecha_entrega_tn3', [
  async (session, results, next) => {
    session.beginDialog('/sectionRun')
  },
  async (session, results, next) => {
    session.beginDialog('/sectionPhone')
  },
  async (session, args, next) => {
    session.userData.tienda = 'Internet'
    session.userData.nivel1 = 'Despachos'
    session.userData.nivel2 = 'Cambio Fecha de entrega'
    session.userData.nivel3 = 'Cambio Fecha de entrega'
    session.beginDialog('/reclamo_generico')
  }
])