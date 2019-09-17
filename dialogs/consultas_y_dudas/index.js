const intentLuis = require("../../functions/salidaDinamica")

bot.dialog('/consultas_y_dudas', [
  (session, args, next) => {
    const menuOptions = `Obtener Boleta|Información Tiendas|Consulta Solicitud|Retiro en Tienda`
    const menuText = 'Te puedo ayudar con los siguientes temas:'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Obtener Boleta':
          session.beginDialog('/copia_boleta')
          break
        case 'Información Tiendas':
          session.beginDialog('/ubicacion_tienda')
          break
        case 'Consulta Solicitud':
          session.beginDialog('/consulta_reclamo')
          break
        case 'Retiro en Tienda':
          session.beginDialog('/informacion_retiro_tienda')
          break
      }
    } else {
      session.userData.sectionSalida = '/consultas_y_dudas'
      session.beginDialog('/salida')
    }
  }
])