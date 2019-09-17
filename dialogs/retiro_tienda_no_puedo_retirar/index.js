/**
 * Se elimina intento de forma directa para unificar con el intento de modificación de datos de una orden de compra
 * Relacionado con HU: https://jira.adessa.cl/browse/SAC-644
 * 11/12/2018
 */
const botReply = require('./text')
require('./../feedback')
bot.dialog('/retiro_tienda_no_puedo_retirar', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endDialog()
  }
])