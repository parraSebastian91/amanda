// *****************************************************************
// *                        Reclamos y Webtracking                 *
// *****************************************************************
require('./sectionEndConversation')
const email = require('./../validaciones/email')
const respuestaBot = require("./text.js")
const { MensajeDeAyuda } = require("../../utils")
const sectionEmail_solicitud_email_usuario_web = '$ingreso_email$ ¿Me podrías indicar el correo electrónico asociado a tu cuenta?'
const sectionEmail_reintento_email_usuario_web = '$reintento_email$ Lo siento, pero el correo ingresado es incorrecto o no es el correo asociado a tu cuenta. ¿Me podrías indicar nuevamente el correo asociado a tu cuenta?'
bot.dialog('/sectionEmail', [
  (session, args, next) => {
    session.userData.dataProgram.palabraCorta = true
    if (args && args.dialogRetry) {
      session.userData.dialogRetry += 1
      if (session.userData.dialogRetry > 2) {
        session.userData.dialogRetry = 1
        session.userData.dataProgram.palabraCorta = false
        session.beginDialog('/end_conversation', { mensaje: respuestaBot.sectionEmail_email_no_valido })
        // session.send(respuestaBot.sectionEmail_email_no_valido)
        // MensajeDeAyuda(session)
        // session.endConversation()        
      } else {
        let msg
        if (!(args && args.DialogClave_web)) {
          session.userData.DialogClave_web = 0
          msg = respuestaBot.sectionEmail_reintento_email
        } else {
          session.userData.DialogClave_web = 1
          msg = sectionEmail_reintento_email_usuario_web
        }
        // builder.Prompts.text(session, respuestaBot.sectionEmail_reintento_email)
        builder.Prompts.text(session, msg)
      }
    } else {
      let msg
      if (!(args && args.DialogClave_web)) {
        session.userData.DialogClave_web = 0
        msg = respuestaBot.sectionEmail_solicitud_email
      } else {
        session.userData.DialogClave_web = 1
        msg = sectionEmail_solicitud_email_usuario_web
      }
      // builder.Prompts.text(session, respuestaBot.sectionEmail_reintento_email)
      builder.Prompts.text(session, msg)
    }
  },
  (session, results, next) => {
    const isValidEmail = email.validateEmail(results.response)
    let body = ((session.userData.DialogClave_web === 0) ? { dialogRetry: true } : { dialogRetry: true, DialogClave_web: 1 })
    if (!isValidEmail) {
      session.replaceDialog('/sectionEmail', body)
      return
    } else {
      results.response = results.response.toLowerCase()
      session.userData.dataProgram.palabraCorta = false
      session.endDialogWithResult(results)
    }
  }
])