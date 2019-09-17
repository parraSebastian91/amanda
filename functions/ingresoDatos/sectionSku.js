require('./sectionEndConversation')
const validacionSku = require('./../validaciones/sku')
const noRecuerdaOC = require("../validaciones/input").noRecuerdaOC
bot.dialog('/sectionSku', [
  async (session, args, next) => {
    session.dialogData.index = (args && 'index' in args) ? args.index : 0;
    builder.Prompts.text(session, preguntas[session.dialogData.index])
  },
  async (session, results, next) => {
    let noRecuerdaOCResult = await noRecuerdaOC(results.response)
    if (noRecuerdaOCResult) {
      session.beginDialog('/como_obtener_sku')
      session.beginDialog('/sectionSku', session.dialogData)
    } 
    session.dialogData.index++
    const isValidSku = validacionSku(results.response)

    if (session.dialogData.index === 2) {
      session.beginDialog('/end_conversation')
      // session.endConversation()
      // MensajeDeAyuda(session)
    } else if (isValidSku && session.dialogData.index < 2) {
      session.dialogData.sku = results.response.toLowerCase()
      session.endDialogWithResult(session.dialogData)
    } else {
      session.replaceDialog('/sectionSku', session.dialogData)
    }
  }
])

const preguntas = [
  '¿Me podrías indicar cuál es el código del producto que deseas consultar?',
  'Lo siento, pero el código ingresado es incorrecto o no es válido. ¿Me podrías indicar nuevamente un código?'
]
