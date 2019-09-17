// const builder = require('botbuilder')

bot.dialog('/sectionCheckbox', [
  async (session, results, next) => {
    if (session.message.value && session.message.value.MultiSelectVal != null) {
      session.userData.checkBoxSelected = session.message.value.MultiSelectVal
      session.endDialog()
      return
    }
    const checkBox = session.userData.checkBox
    try {
      var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.0",
          "body": [{
            "type": "TextBlock",
            "text": checkBox.title
          },
          {
            "type": "Input.ChoiceSet",
            "id": "MultiSelectVal",
            "isMultiSelect": true,
            "choices": checkBox.items
          }
          ],
          "actions": [{
            "type": "Action.Submit",
            "title": "Confirmar",
            "data": {
              "id": "1234567890"
            }
          }]
        }
      }
      console.log(JSON.stringify(card))
      var msg = new builder.Message(session).addAttachment(card)
      session.send(msg)
    } catch (e) {
      console.log(e)
      session.send('No he logrado encontrar información de tu compra, intenta más tarde')
      session.endConversation()
    }
  }
])