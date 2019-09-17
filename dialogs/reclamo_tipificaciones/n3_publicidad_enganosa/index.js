require('../../../functions/ingresoDatos/sectionEndConversation')
require('../../../functions/ingresoDatos/sectionPhone')
require('../../../functions/ingresoDatos/sectionEmail')
require('../../../functions/ingresoDatos/sectionRun')
require('../../../functions/ingresoDatos/sectionOC')
const validarFechaSessionActiva = require("../../../functions/validaciones/fecha").validarFechaSessionActiva
const { MensajeDeAyuda } = require('../../../utils')

bot.dialog('/n3_publicidad_enganosa', [
  (session, results, next) => {
    session.send('Lo siento, si deseas generar una solicitud por este inconveniente en nuestro sitio web necesitaré algunos datos adicionales.')
    session.beginDialog('/sectionOC')
  },
  (session, results, next) => {
    session.userData.dialogRetry = 1
    if (!session.userData.dataProgram.sessionActiva) {
      session.userData.orden_compra = results.response
      session.userData.dialogRetry = 1
      session.beginDialog("/sectionEmail")
    } else {
      session.userData.email = session.userData.dataPersonal.emailUsuario
      session.userData.rut = session.userData.dataPersonal.rutUsuario
      next()
    }
  },
  async (session, results, next) => {
    session.userData.dialogRetryOC = 1
    if (!validarFechaSessionActiva(session.userData)) {
      session.userData.email = results.response
      session.beginDialog("/sectionRun")
    } else {
      next()
    }
  },
  async (session, results, next) => {
    session.beginDialog('/sectionPhone')
  },
  async (session, args, next) => {
    session.userData.tienda = 'Internet'
    session.userData.nivel1 = 'Experiencia de compra'
    session.userData.nivel2 = 'Publicidad engañosa'
    session.userData.nivel3 = 'Publicidad engañosa'
    next()
  },
  async (session, results, next) => {
    const msgError = validatePromptsText('Lo siento pero el motivo de tu solicitud de servicio es inválido', session, 3)
    if (msgError) {
      if (session.userData.retryDialog == 0) {
        builder.Prompts.text(session, 'Este es el último paso, por favor describe en pocas palabras la solicitud que deseas ingresar')
      } else {
        builder.Prompts.text(session, 'Tu descripción es muy corta, por favor intenta ser más descriptivo para poder ayudarte.')
      }
    }
  },
  async (session, results, next) => {
    if (results.response.length >= 10) {
      session.userData.descripcion = results.response
      const msg = await CONTROLLER.reclamoGeneral.createSS(session.userData)
      session.beginDialog('/end_conversation', { mensaje: msg })
      // session.send(msg)
      // MensajeDeAyuda(session)
      // session.endConversation()
    } else {
      session.userData.retryDialog += 1
      session.replaceDialog('/n3_publicidad_enganosa', {
        reprompt: true
      })
    }
  }
])