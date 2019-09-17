require('./sectionArgs')

const botReply = require('./text')
const intentLuis = require("../../functions/salidaDinamica")

bot.dialog('/sectionMetodoPago', [
  (session, args, next) => {
    const menuOptions = `Tarjeta CMR|Tarjeta de Débito|Tarjeta de Crédito|Servipag`
    const menuText = botReply.text7
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 2
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Tarjeta CMR':
          session.userData.mediopago = 'Tarjeta CMR'
          session.beginDialog('/sectionArgs')
          break
        case 'Tarjeta de Débito':
          session.userData.mediopago = 'Tarjeta Débito'
          session.beginDialog('/sectionArgs')
          break
        case 'Tarjeta de Crédito':
          session.userData.mediopago = 'Tarjeta Crédito'
          session.beginDialog('/sectionArgs')
          break
        case 'Servipag':
          session.userData.mediopago = 'Servipag'
          session.beginDialog('/sectionArgs')
          break
      }
    } else {
      // session.endConversation('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
      // session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
      let resultIntent = await intentLuis.dialogIntent(session)
      session.beginDialog(`/${resultIntent}`)
      return
    }
  }
])