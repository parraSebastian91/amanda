require('../../functions/ingresoDatos/sectionEndConversation')
require('../../functions/ingresoDatos/sectionRun')
require('../../functions/ingresoDatos/sectionPhone')
const botReply = require('./text')
const { MensajeDeAyuda } = require('../../utils')
const logger = require('./../../utils/logger')

bot.dialog('/solicitudRutTelefonoUsuario', [
  async (session, results, next) => {
    // console.log('info: solicitud datos quiebre')
    logger.info('solicitud datos quiebre')
    session.send(botReply.solicitudRutTelefono_datos_adicionales)
    session.beginDialog('/sectionRun')
  },
  async (session, results, next) => {
    const rutCompraValida = session.userData.rutCompraValida
    const rut = session.userData.rut
    if (rutCompraValida === rut) {
      delete session.userData.rutCompraValida
      session.beginDialog('/sectionPhone')
    } else {
      // console.log('info: valida rut con rut de oc')
      logger.info('valida rut con rut de oc')
      delete session.userData.rutCompraValida
      session.beginDialog('/end_conversation', { mensaje: botReply.solicitudRutTelefono_rut_no_registrado_en_oc })
      // session.endConversation(botReply.solicitudRutTelefono_rut_no_registrado_en_oc)
      // MensajeDeAyuda(session)

    }
  }
])