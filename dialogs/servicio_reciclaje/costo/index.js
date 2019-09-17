require('./../../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda } = require('../../../utils')

bot.dialog('/reciclaje_domicilio_costo', [
  (session, args, next) => {
    let msg = 'El servicio de Reciclaje de Falabella tiene un costo de $29.990. Puedes revisar más detalles aquí  [aquí](https://www.falabella.com/falabella-cl/page/Programa-Despacho?sid=HO_HH_PRO_0044269&staticPageId=29800001)'
    session.beginDialog('/end_conversation', { mensaje: msg })
    // session.send()
    // session.endDialog()
    // MensajeDeAyuda(session)
  }
]) 