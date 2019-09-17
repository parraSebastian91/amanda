require('./gift_card')
require('./armado_de_muebles')
require('./inconformidad_servicio')
require('./garantia_extendida')
require('../../reclamo_generico')
const intentLuis = require("../../../../functions/salidaDinamica")
const botReply = require('./text')

bot.dialog('/problema_servicio', [
  (session, args, next) => {
    const menuOptions = `Gift Card|Problemas con Garantía|Garantía Extendida`
    const menuText = botReply.text1
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {

    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Gift Card':
          session.userData.nivel2 = 'Gift Card'
          session.userData.nivel3 = 'Problema con Gift Card'
          session.beginDialog('/gift_card')
          break
        /*
        case 'Armado de Muebles':
        session.userData.nivel2 = 'Servicio Armado de Muebles'
        session.beginDialog('/armado_de_muebles')
        break
        */
        case 'Problemas con Garantía':
          session.userData.nivel2 = 'Garantía Extendida'
          session.beginDialog('/inconformidad_servicio')
          break
        case 'Garantía Extendida':
          session.userData.nivel2 = 'Garantía Extendida'
          session.beginDialog('/garantia_extendida')
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