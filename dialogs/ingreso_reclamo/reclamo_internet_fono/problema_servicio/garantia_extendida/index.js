require('./../../../../../functions/ingresoDatos/sectionEmail')
require('./../../../../../functions/ingresoDatos/sectionArgs')
require('./inconformidad_post_venta')
require('./uso_garantia_extendida')
require('../../../reclamo_generico')

const botReply = require('./text')
const intentLuis = require("../../../../../functions/salidaDinamica")

bot.dialog('/garantia_extendida', [
  (session, args, next) => {
    const menuOptions = `Inconformidad Postventa|Uso Garantía Extendida`
    const menuText = 'Entiendo, tu solicitud de servicio tiene relación con Garantía Extendida ¿Cuál de las siguientes clasificaciones describe mejor tu solicitud?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 2
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Inconformidad Postventa':
          session.userData.nivel3 = 'Inconf Serv Post-Venta Ext'
          session.beginDialog('/reclamo_generico')
          break
        case 'Uso Garantía Extendida':
          session.userData.nivel3 = 'Solicitud Uso Garantía Ext'
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
  },
])