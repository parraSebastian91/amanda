require('../../../reclamo_generico')

const botReply = require('./text')

bot.dialog('/inconformidad_servicio', [
  (session, args, next) => {
    session.userData.nivel3 = 'Inconf Serv Post-Venta Ext'
    session.beginDialog('/reclamo_generico')
  }
])