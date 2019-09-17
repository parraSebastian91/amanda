//const builder = require("botbuilder");
const cardObj = require("./cardsObj/formularioCambioBaF");
const { ErrorPrompt } = require("../../utils")

bot.dialog("/sectionFormularioCambioBoleta", [
  (session, args, next) => {
    try {
      if (session.message && session.message.value) {
        session.userData.dataExtraFormulario = session.message.value
        session.message.value = null
        session.endDialog()
        return
      } else {
        let msg = new builder.Message(session).addAttachment(cardObj)
        session.send(msg)
      }
    } catch (e) {
      ErrorPrompt(e)
    }
  }
])