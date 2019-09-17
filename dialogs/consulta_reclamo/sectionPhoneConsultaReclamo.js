// *****************************************************************
// *                        Solo para consulta_reclamo                     *
// *****************************************************************
const validacionFono = require('./../../functions/validaciones/telefono.js')
bot.dialog('/sectionPhoneConsultaReclamo', [
  (session, args, next) => {
    const msgError = validatePromptsText('Lo siento pero el número de teléfono es inválido', session, 3)
    if (msgError || args && !args.retryPhone) {
      builder.Prompts.text(session, '¿Me podrías indicar algún teléfono de contacto para comunicarnos contigo? (Ejemplo: 569XXXXXXXX)')
    } else {
      session.userData.retryDialog = 3
      session.endDialog()
      session.endConversation()
    }
  },
  async (session, results, next) => {
    const fono = await new Promise(async resolve => {
      resolve(await validacionFono.validatePhone(results))
    })

    if (!fono) {
      session.userData.retryDialog += 1
      session.replaceDialog('/sectionPhoneConsultaReclamo', {
        retryPhone: true
      })
      return false
    }
    session.userData.telefono = fono
    session.endDialogWithResult()
  }
])