require('./../../../reclamo_generico')
const intentLuis = require("../../../../../functions/salidaDinamica")

const botReply = require('./text')

bot.dialog('/desconoce_compra', [
  (session, args, next) => {
    const menuOptions = `Producto Entregado|Producto no Entregado`
    const menuText = botReply.text1
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 2
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Producto Entregado':
          session.userData.nivel3 = 'Producto Entregado'
          session.beginDialog('/reclamo_generico')
          break
        case 'Producto no Entregado':
          session.userData.nivel3 = 'Producto No Entregado'
          session.beginDialog('/reclamo_generico')
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