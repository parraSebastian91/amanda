require('./../../../reclamo_generico')
const intentLuis = require("../../../../../functions/salidaDinamica")

bot.dialog('/despacho_atrasado', [
  (session, args, next) => {
    /*** 25/06/2018 a solicitud de Natalia Osses se esconde tipología nivel 3 ***/
    //const menuOptions = `Incumplimiento Fecha Cambio|Incumplimiento Fecha Entrega|Incumplimiento Fecha Retiro|Incumplimiento`
    const menuOptions = `Incumplimiento Fecha Cambio|Incumplimiento Fecha Entrega|Incumplimiento Fecha Retiro`
    const menuText = 'Entiendo, tu solicitud de servicio tiene relación con Despachos ¿Cuál de las siguientes clasificaciones describe mejor tu solicitud?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      //session.userData.requirePayMethod = true;
      switch (results.response.entity) {
        case 'Incumplimiento Fecha Cambio':
          session.userData.nivel3 = 'Incumplimiento fecha Cambio'
          session.beginDialog('/reclamo_generico')
          break
        case 'Incumplimiento Fecha Entrega':
          session.userData.nivel3 = 'Incumplimiento fecha Entrega'
          session.beginDialog('/reclamo_generico')
          break
        case 'Incumplimiento Fecha Retiro':
          session.userData.nivel3 = 'Incumplimiento fecha Retiro'
          session.beginDialog('/reclamo_generico')
          break
          /*** 25/06/2018 a solicitud de Natalia Osses se esconde tipología nivel 3 ***/
          /*
          case 'Incumplimiento':
              session.userData.nivel3 = 'Incumplimiento Sin Stock'
              session.beginDialog('/reclamo_generico')
              break
          */
      }
    } else {
      // session.userData.sectionSalida = '/despacho_atrasado'
      // session.beginDialog('/salida')
      let resultIntent = await intentLuis.dialogIntent(session)
      session.beginDialog(`/${resultIntent}`)
      return
    }
  }
])