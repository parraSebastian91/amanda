require('./../../../functions/ingresoDatos/sectionEndConversation')
const botReply = require('./text')
const { MensajeDeAyuda } = require('../../../utils')
require('./../../feedback')
require('./desea_reenvio')

bot.dialog('/clave_web', [
  async (session, args, next) => {
    const menuOpcion = 'SI|NO'
    const menuTitulo = '¿Ya te enviamos la clave?'
    builder.Prompts.choice(session, menuTitulo, menuOpcion, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      const opcion = results.response.entity.toLocaleLowerCase().trim()
      switch (opcion) {
        case 'si':
          session.beginDialog('/confirma_reenvio')
          break
        case 'no':
          session.beginDialog('/end_conversation', { mensaje: botReply.geneticoClave_link_recupera_clave })
          // session.send(botReply.geneticoClave_link_recupera_clave)
          // session.endConversation()
          // MensajeDeAyuda(session)
          break
      }
    }
    else {
      let resultIntent = await intentLuis.dialogIntent(session)
      session.beginDialog(`/${resultIntent}`)
    }

  }
])
