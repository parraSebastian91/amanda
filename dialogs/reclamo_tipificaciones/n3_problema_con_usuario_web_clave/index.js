require('../../../functions/ingresoDatos/sectionEndConversation')
require('../../../functions/ingresoDatos/sectionPhone')
require('../../../functions/ingresoDatos/sectionEmail')
require('../../../functions/ingresoDatos/sectionRun')
require('../../../functions/ingresoDatos/sectionOC')
const validarFechaSessionActiva = require("../../../functions/validaciones/fecha").validarFechaSessionActiva
const { MensajeDeAyuda } = require('../../../utils')

bot.dialog('/n3_problema_con_usuario_web_clave', [
  (session, results, next) => {
    session.send('Entiendo que tienes problemas para resetear tu contraseña web de Falabella. Para poder ayudarte a obtener tu clave necesitaré algunos datos adicionales.')
    //session.beginDialog('/sectionOC')
    next()
  },  
  async (session, results, next) => {
    session.userData.dialogRetryOC = 1
    if (!validarFechaSessionActiva(session.userData)) {
      //session.userData.email = results.response
      session.beginDialog("/sectionRun")
    } else {
      next()
    }
  },
  (session, results, next) => {
    session.userData.dialogRetry = 1
    if (!session.userData.dataProgram.sessionActiva) {
      session.userData.rut = results.response
      session.userData.dialogRetry = 1
      session.beginDialog("/sectionEmail",{DialogClave_web:1})
    } else {
      session.userData.email = session.userData.dataPersonal.emailUsuario
      session.userData.rut = session.userData.dataPersonal.rutUsuario
      next()
    }
  },
  async (session, results, next) => {
    if (!session.userData.dataProgram.sessionActiva) {
      session.userData.email = results.response
      next()
    }
    else{
      next()
    }
  },
  async (session, results, next) => {    
    session.beginDialog('/sectionPhone')
  },
  async (session, results, next) => {
    //session.userData.telefono = results.response
    session.userData.tienda = 'Internet'
    session.userData.nivel1 = 'Experiencia de compra'
    session.userData.nivel2 = 'Experiencia Web'
    session.userData.nivel3 = 'Problema con Usuario web/Clave'
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
      //session.userData.motivo_reclamo = results.response
      const msg = await CONTROLLER.reclamoGeneral.createSS(session.userData)
      session.beginDialog('/end_conversation', { mensaje: msg })
      // session.send(msg)
      // MensajeDeAyuda(session)
      // session.endConversation()
    } else {
      session.userData.retryDialog += 1
      session.replaceDialog('/n3_problema_con_usuario_web_clave', {
        reprompt: true
      })
    }
  }
])