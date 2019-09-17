require('./../../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda } = require('../../../utils')

bot.dialog('/instalacion_domicilio_productos', [
  (session, args, next) => {
    let msg = 'El Servicio de Instalación de Falabella sólo se encuentra disponible para productos de Línea Blanca.'
    session.beginDialog('/end_conversation', { mensaje: msg })
    // session.send()
    // session.endDialog()
    // MensajeDeAyuda(session)
  }
])
