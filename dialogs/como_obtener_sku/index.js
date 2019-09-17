const botReply = require('./text')
// const createAnimationCard = require('./../../functions/gif')
const { AdaptiveCard } = require('../../utils')

bot.dialog('/como_obtener_sku', [
  (session) => {
    const url = 'https://chatbotstorageblob.blob.core.windows.net/assets/img/view_SKU.gif'
    const body = [
      {
        'type': 'ColumnSet',
        'columns': [
          {
            'type': 'Column',
            'width': 'auto',
            'items': [
              {
                'type': 'Image',
                'url': url
              }
            ]
          }
        ]
      }
    ]
    // const title = 'Como obtener SKU'
    // const gifResult = createAnimationCard.gif(session, title, url)
    // const reply = new builder.Message(session).addAttachment(gifResult)
    const action = [
      {
        'type': 'Action.OpenUrl',
        'id': 'ampliar-imagen',
        'title': 'Ampliar imagen',
        'url': url
      }
    ]
    const reply = AdaptiveCard(session, body, action)
    session.send(botReply.text1)
    session.send(reply)
    session.endConversation()
  }
])