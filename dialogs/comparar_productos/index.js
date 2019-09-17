const botReply = require('./text')
// const createAnimationCard = require('./../../functions/gif')
const { AdaptiveCard } = require('../../utils')

bot.dialog('/comparar_productos', [
  (session) => {
    session.send(botReply.text1)
    const url = 'https://chatbotstorageblob.blob.core.windows.net/assets/img/out.gif'
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
    // const title = 'Como puedo comparar un producto'
    // const gifResult = createAnimationCard.gif(session, title, url)
    // const reply = new builder.Message(session).addAttachment(gifResult)
    const action =[
      {
        'type': 'Action.OpenUrl',
        'id': 'ampliar-imagen',
        'title': 'Ampliar imagen',
        'url': url
      }
    ]
    const reply = AdaptiveCard(session, body, action)
    session.send(reply)
    session.send(botReply.text2)
    session.endDialog()
  }
])

