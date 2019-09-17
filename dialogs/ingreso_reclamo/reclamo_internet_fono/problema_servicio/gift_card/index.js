require('./../../../../../functions/ingresoDatos/sectionEndConversation')
require('./../../../../../functions/ingresoDatos/sectionArgs')
require('./../../../../../functions/ingresoDatos/sectionEmail')
require('../../../../../functions/ingresoDatos/sectionPhone')
const { MensajeDeAyuda } = require("../../../../../utils")

const botReply = require('./text')

bot.dialog('/gift_card', [
  //(session, args, next) => {
  // session.userData.nivel3 = 'Problema con Gift Card'
  //session.send(botReply.text1)
  // session.userData.dialogRetry = 1
  // session.beginDialog('/sectionEmail')
  //},
  // async (session, results, next) => {
  //   session.userData.dialogRetry = 1
  //   session.beginDialog('/sectionPhone')
  // },
  async (session, results, next) => {
      session.userData.nivel3 = 'Problema con Gift Card'
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
        session.replaceDialog('/gift_card', {
          reprompt: true
        })
      }
    }
])