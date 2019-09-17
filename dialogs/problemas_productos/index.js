const intentLuis = require("../../functions/salidaDinamica")

bot.dialog('/problemas_productos', [
  (session, args, next) => {
    const menuOptions = `Cambiar Producto|Devolver Producto|Servicio Técnico`
    const menuText = 'Entiendo que has tenido problemas con tu producto. ¿En qué tema específico te puedo ayudar?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Cambiar Producto':
          session.beginDialog('/cambio_producto')
          break
        case 'Devolver Producto':
          session.beginDialog("/anulacion_orden_compra", { textDevolucion: true })
          break
        case 'Servicio Técnico':
          session.beginDialog('/contacto_servicio_tecnico')
          break
      }
    } else {
      // session.userData.sectionSalida = '/servicio_postventa'
      // session.beginDialog('/salida')
      let resultIntent = await intentLuis.dialogIntent(session)
      session.beginDialog(`/${resultIntent}`)
      return
    }
    //else {
    //console.log('---------ELSE----------')
    //session.endConversation('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
    //session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
    //}
  }
])