const botReply = require('./text')
// const createAnimationCard = require('./../../functions/gif')
const { AdaptiveCard } = require('../../utils')

bot.dialog('/como_eliminar_producto', [
  (session, args, next) => {
    const url = 'https://chatbotstorageblob.blob.core.windows.net/assets/img/product_delete.gif'
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
    // const title = 'Como puedo eliminar un producto'
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
    session.endDialog()
  }
])
