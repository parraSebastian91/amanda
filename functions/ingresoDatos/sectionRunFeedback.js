// *****************************************************************
// *                        Solo para reclamos                     *
// *****************************************************************

require('./sectionPhone')
require('./../../dialogs/ingreso_reclamo/reclamo_internet_fono')
const validacionRut = require('./../validaciones/rut')

bot.dialog('/sectionRunFeedback', [
  (session, args, next) => {
    const msgError = validatePromptsText('Lo siento pero el RUT es inválido', session, 3)
    if (msgError) {
      if (args && args == 'is_solicitud_callback') {
        session.send('Para que uno de nuestros ejecutivos te pueda contactar necesitaré algunos datos.')
        builder.Prompts.text(session, '¿Cuál es tu número de RUT?')
      } else {
        builder.Prompts.text(session, 'Necesito tu RUT para transferirte a un ejecutivo. (Ejemplo: 12345678-9)')
      }
    } else {
      session.userData.retryDialog = 0
      session.endDialog()
      session.endConversation()
    }
  },
  async (session, results, next) => {
    const rut = await new Promise(async resolve => {
      resolve(await validacionRut.validateRut(results))
    })

    if (!rut) {
      session.userData.retryDialog += 1
      session.replaceDialog('/sectionRun')
      return false
    }
    session.userData.rut = rut
    session.send(`Perfecto, estoy buscando información de tu RUT: ${rut}`)
    const currentClientInfo = await new Promise((resolve, reject) => {
      resolve(SIEBEL.getClientInfo(rut))
    })
    const existeFlag = currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto[0].existeFlag
    if (existeFlag == 'No Existe') {
      session.send('Lo siento pero no he logrado encontrar información asociada a tu RUT en nuestros sistemas.')
      session.endConversation()
    } else {
      session.userData.sectionDialog = '/sectionPhone'
      session.beginDialog('/sectionPhone')
    }
  }
])