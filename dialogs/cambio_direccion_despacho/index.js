/**
 * Se elimina intento de forma directa para unificar con el intento de modificación de datos de una orden de compra
 * Relacionado con HU: https://jira.adessa.cl/browse/SAC-644
 * 11/12/2018
 */
const botReply = require('./text')
require('./../feedback')

bot.dialog('/cambio_direccion_despacho', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.endConversation()
    session.beginDialog('/feedback', { path_origen_feedback: "/cambio_direccion_despacho",  })
  }
])