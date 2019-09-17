// const botReply = require('./text')
// const createAnimationCard = require('./../../functions/gif')
const { AdaptiveCard } = require('../../utils')

bot.dialog('/explicacion_procedimiento_compra', [
  (session) => {
    session.send('En el siguiente vídeo puedes ver cómo comprar en Falabella.com. Si tienes problemas para realizar tu compra puedes llamar a nuestro servicio de asistencia online al [2 23907910](tel:2 23907910).')
    const urls = ['https://chatbotstorageblob.blob.core.windows.net/assets/img/product_select.gif', 'https://chatbotstorageblob.blob.core.windows.net/assets/img/product_pay_method.gif']
    for (const url of urls) {
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
      const action = [
        {
          'type': 'Action.OpenUrl',
          'id': 'ampliar-imagen',
          'title': 'Ampliar imagen',
          'url': url
        }
      ]
      const reply = AdaptiveCard(session, body, action)
      session.send(reply)
    }
    session.endDialog()
  }
])
