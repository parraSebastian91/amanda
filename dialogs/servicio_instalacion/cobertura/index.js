require('./../../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda } = require('../../../utils')

bot.dialog('/instalacion_domicilio_cobertura', [
  (session, args, next) => {
    let msg = 'El Servicio de Instalación de Falabella, sólo se encuentra disponible en la Región Metropolitana. Pronto te contaremos de nuevas Zonas de Cobertura.'
    session.beginDialog('/end_conversation', { mensaje: msg })
    //session.send()    
    // session.endDialog()
    // MensajeDeAyuda(session)
  }
])
.0