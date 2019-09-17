require('./../informacion_banco_falabella')
require('./../informacion_viajes_falabella')
require('./../informacion_seguros_falabella')
require('./../preguntas_frecuentes_sodimac')
require('./../preguntas_frecuentes_tottus')
const intentLuis = require("../../functions/salidaDinamica")

bot.dialog('/generico_otros_negocios', [
  (session, args, next) => {
    const menuOptions = `Banco Falabella|Viajes Falabella|Seguros Falabella|Sodimac|Tottus`
    const menuText = 'No hay problema ¿De qué otro negocio de Falabella necesitas información?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Banco Falabella':
          session.beginDialog('/informacion_banco_falabella')
          break
        case 'Viajes Falabella':
          session.beginDialog('/informacion_viajes_falabella')
          break
        case 'Seguros Falabella':
          session.beginDialog('/informacion_seguros_falabella')
          break
        case 'Sodimac':
          session.beginDialog('/preguntas_frecuentes_sodimac')
          break
        case 'Tottus':
          session.beginDialog('/preguntas_frecuentes_tottus')
          break
      }
    } else {
      //session.endConversation('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
      //session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
      let resultIntent = await intentLuis.dialogIntent(session)
      session.beginDialog(`/${resultIntent}`)
      return
    }
  }
])