require('./../../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda } = require('../../../utils')

bot.dialog('/instalacion_domicilio_costo', [
  (session, args, next) => {
    let msg = 'El Servicio de Instalación de Falabella se encuentra disponible para compras de Refrigeradores, Lavadoras, Secadoras, Lavavajillas y Cocina convencional. Si tu producto requiere instalación certificada el servicio se realizará sin costo. Para más detalles puedes revisar las condiciones [aquí](https://www.falabella.com/falabella-cl/page/Programa-Despacho?sid=HO_HH_PRO_0044269&staticPageId=29800001)'
    session.beginDialog('/end_conversation', { mensaje: msg })
    // session.send()s
    // session.endDialog()
    // MensajeDeAyuda(session)
  }
])
