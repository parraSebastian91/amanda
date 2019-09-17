require('./sectionEndConversation')
const { MensajeDeAyuda } = require("../../utils")
// const builder = require('botbuilder')

bot.dialog('/sectionList', [
  (session, args, next) => {
    //Validamos si pasamos argumentos al diálogo con el flag de quiebre en la(s) subórden(es)
    if (args && args.flag_quiebre) {
      session.dialogData.flag_quiebre = args.flag_quiebre
      session.send('Estimado cliente, a continuación puedes revisar el detalle de tu orden:')
    } else {
      session.dialogData.flag_quiebre = false
    }
    next()
  },
  async (session, results, next) => {
    if (session.message.value) {
      session.endDialog()
      return
    }
    try {
      const subOrdenArray = session.userData.subOrdenesProductos
      let body = []
      let texto_cabecera
      if (!session.dialogData.flag_quiebre) {
        if (session.userData.numSubOrdenesProductos > 1) {
          texto_cabecera = 'Hemos dividido tu orden para que la puedas visualizar con detalle:'
        } else {
          texto_cabecera = 'El detalle de tu orden es el siguiente:'
        }
        body = [{
          "type": "Container",
          "items": [{
            "type": "TextBlock",
            "text": texto_cabecera
          }]
        }]
      }

      subOrdenArray.forEach(function (e, i) {
        let template_products = {
          "type": "TextBlock",
          "text": e.value_template_products,
          "value": e.value_template_products
        }
        body.push(template_products)
        body.push(e.products)
        let template = {
          "type": "TextBlock",
          "text": e.value_template,
          "value": e.value_template
        }
        body.push(template)
        /*
        let ProductsFactSet = {
          "type": "FactSet",
          "facts": e.products
        }
        */
        /*body.push(ProductsFactSet)*/
      })
      let card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.0",
          "body": body,
          "actions": []
        }
      }

      console.log(JSON.stringify(card))
      var msg = new builder.Message(session).addAttachment(card)
      session.send(msg)
    } catch (e) {
      let msg = 'No he logrado encontrar información de tu compra, intenta más tarde'
      session.beginDialog('/end_conversation', { mensaje: msg })
      // session.send('No he logrado encontrar información de tu compra, intenta más tarde')
      // session.endConversation()
    }

    if (!session.dialogData.flag_quiebre) {
      if (!session.userData.flagTotalEntregaFalsoMensajeAyuda) {
        session.userData.flagTotalEntregaFalsoMensajeAyuda = false
        // MensajeDeAyuda(session)
      }
      // session.endConversation()
      session.beginDialog('/end_conversation')
    }
  }
])