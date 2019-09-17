require('./../../../functions/ingresoDatos/sectionEndConversation')
const botReply = require('./text')
const { MensajeDeAyuda } = require('../../../utils')
require('./../../reclamo_tipificaciones/n3_problema_con_usuario_web_clave')

bot.dialog('/confirma_reenvio', [
  async (session, next) => {
    const menuTitulo = '¿Deseas reenvío?'
    const menuOpcion = 'SI|NO'
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
          session.beginDialog('/n3_problema_con_usuario_web_clave')
          break
        case 'no':
          session.beginDialog('/end_conversation', { mensaje: botReply.geneticoClave_aqui_24_7 })
          // session.send(botReply.geneticoClave_aqui_24_7)
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