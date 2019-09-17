require('./../../functions/ingresoDatos/sectionEndConversation')
require('./../feedback')
const botReply = require('./text')
const { MensajeDeAyuda } = require("../../utils")
const intentLuis = require("../../functions/salidaDinamica")

bot.dialog('/modificacion_datos_orden_compra', [
  (session, args, next) => {
    session.send(botReply.text1)
    const menuOptions = `SI|NO`
    const menuText = botReply.textoMenu
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    try {
      let opcion = (results.response && results.response.entity) ? results.response.entity : session.message.text
      switch (opcion) {
        case 'SI':
          session.replaceDialog('/anulacion_orden_compra')
          break
        case 'NO':
          session.beginDialog('/end_conversation')
          // MensajeDeAyuda(session)
          // session.endConversation()
          break
        default:
          let resultIntent = await intentLuis.dialogIntent(session)
          session.beginDialog(`/${resultIntent}`)
          break
      }
    } catch (e) {
      console.log('Dialog : modificacion_datos_orden_compra   Error : ' + e.message)
    }
  }
])