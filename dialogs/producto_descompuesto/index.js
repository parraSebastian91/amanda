const intentLuis = require("./../../functions/salidaDinamica")

bot.dialog('/producto_descompuesto', [
  (session, args, next) => {
    const menuOptions = `Garantía|Garantía Extendida|Servicio Técnico`
    const menuText = '¿No funciona tu producto? ¿En qué te puedo ayudar?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Garantía':
          session.beginDialog('/cambio_producto')
          break
        case 'Garantía Extendida':
          session.beginDialog('/garantia_extendida_utilizar')
          break
        case 'Servicio Técnico':
          session.beginDialog('/contacto_servicio_tecnico')
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