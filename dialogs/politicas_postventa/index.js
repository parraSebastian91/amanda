const botReply = require('./text')
require('./../feedback')
//require('./../../dialogs/anulacion_orden_compra')
require('./../../dialogs/cambio_producto')
//require('./../../dialogs/devolucion_producto')

bot.dialog('/politicas_postventa', [
  (session, args, next) => {
    //session.send(botReply.text1)
    session.beginDialog('/cambio_producto')
  }
])