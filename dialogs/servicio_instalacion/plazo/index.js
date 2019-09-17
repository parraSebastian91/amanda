require('./../../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda } = require('../../../utils')

bot.dialog('/instalacion_domicilio_plazo', [
  (session, args, next) => {
    let msg ='El Servicio de Instalación de Falabella, se realiza 24 horas despúes de que recibas tu producto. Un equipo especializado realizará la instalación de tu nuevo producto y procederá con el retiro del anterior. El Servicio se realiza de Lunes a Sábado de 9:00 a 18:30 hrs.'
    session.beginDialog('/end_conversation', { mensaje: msg })
    // session.send(')
    // session.endDialog()
    // MensajeDeAyuda(session)
  }
])
