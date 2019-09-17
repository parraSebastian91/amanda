require('./../../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda } = require('../../../utils')

bot.dialog('/reciclaje_domicilio_productos', [
  (session, args, next) => {
    let msg = 'El Servicio de reciclaje de Falabella aplica para compras de Refrigeradores, Lavadoras, Secadoras, Lavavajillas y Cocinas convencionales. El producto a reciclar debe ser el mismo comprado, es decir, si compras una lavadora, retiraremos únicamente una lavadora (no aplica para retiro de otros productos); debe estar desconectado, vacío y cerca de la entrada de la casa o edificio. No puede estar anclado o fijado a paredes, pisos u otras bases.'
    session.beginDialog('/end_conversation', { mensaje: msg })
    // session.send('El Servicio de reciclaje de Falabella aplica para compras de Refrigeradores, Lavadoras, Secadoras, Lavavajillas y Cocinas convencionales. El producto a reciclar debe ser el mismo comprado, es decir, si compras una lavadora, retiraremos únicamente una lavadora (no aplica para retiro de otros productos); debe estar desconectado, vacío y cerca de la entrada de la casa o edificio. No puede estar anclado o fijado a paredes, pisos u otras bases.')
    // session.endDialog()
    // MensajeDeAyuda(session)
  }
])
