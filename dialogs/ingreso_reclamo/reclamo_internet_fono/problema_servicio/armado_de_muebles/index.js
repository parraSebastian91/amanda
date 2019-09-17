require('./cambio_fecha_armado')
require('./reclamo_servicio_armado')
require('./solicitud_armado_de_muebles')
require('../../../../armado_producto')

const botReply = require('./text')
const intentLuis = require("../../../../../functions/salidaDinamica")

bot.dialog('/armado_de_muebles', [
  (session, args, next) => {
    const menuOptions = `Cambio Fecha Armado|Reclamo Servicio Armado|Armado de Muebles`
    const menuText = botReply.text1
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 2
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Cambio Fecha Armado':
          session.userData.nivel3 = 'Cambio Fecha de armado'
          session.beginDialog('/reclamo_generico')
          break
        case 'Reclamo Servicio Armado':
          session.userData.nivel3 = 'Reclamo por Servicio de armado'
          session.beginDialog('/reclamo_generico')
          break
        case 'Armado de Muebles':
          session.userData.nivel3 = 'Solicitud de armado'
          session.beginDialog('/solicitud_armado_de_muebles')
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