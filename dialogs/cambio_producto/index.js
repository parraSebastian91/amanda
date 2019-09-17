const botReply = require('./text')
const createAnimationCard = require('./../../functions/gif')
require('./../cambio_producto/reclamo_producto')
require('./../feedback')
const intentLuis = require("../../functions/salidaDinamica")
const { AdaptiveCard } = require('../../utils')

bot.dialog('/cambio_producto', [
  (session, args, next) => {
    session.send(botReply.politica)
    const menuOptions = `Falabella.com|Tienda`
    const menuText = 'El producto que deseas cambiar ¿lo compraste en tienda o a través de falabella.com?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Falabella.com':
          const url = 'https://chatbotstorageblob.blob.core.windows.net/assets/img/cambio_devolucion.gif'
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
          // const title = 'Mira el siguiente vídeo que te explica como realizar un cambio o devolución en Falabella.com'
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
          session.send(botReply.internet)
          session.send(reply)
          session.send(botReply.aviso)
          session.send(botReply.oc)
          session.beginDialog('/reclamo_producto')
          break
        case 'Tienda':
          session.send(botReply.tienda)
          //session.beginDialog('/feedback', { path_origen_feedback: "" })
          break
        default:
          let resultIntent = await intentLuis.dialogIntent(session)
          session.beginDialog(`/${resultIntent}`)
      }
    } else {
      // session.userData.sectionSalida = '/devolucion_producto'
      // session.beginDialog('/salida')
      let resultIntent = await intentLuis.dialogIntent(session)
      session.beginDialog(`/${resultIntent}`)
    }
  }
])