const intentLuis = require("./../../functions/salidaDinamica")

bot.dialog('/servicio_postventa', [
  (session, args, next) => {
    const menuOptions = `Cambio Producto|Devolución Producto|Servicio Técnico`
    const menuText = '¿En qué te puedo ayudar?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Cambio Producto':
          session.beginDialog('/cambio_producto')
          break
        case 'Devolución Producto':
          session.beginDialog('/anulacion_orden_compra')
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
  }
])