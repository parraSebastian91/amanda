require('./reclamo_internet_fono')
require('./reclamo_tienda')
require('./../../functions/saludos')
const botReply = require('./text')

/*El menu queda comentado debido a la solicitud del spring 19 que se pide solo ingresar cn el canal de internet*/

/*bot.dialog('/ingreso_reclamo', [
  (session, args, next) => {
    session.userData.sectionDialog = ''
    const menuOptions = `Tienda|Internet|Fono Compra`
    const menuText = '¿El reclamo que quieres generar es por alguna situación de Tienda, Internet o Fono Compra?'
    builder.Prompts.choice(session, menuText, menuOptions, { listStyle: builder.ListStyle.button, maxRetries: 0 })
  },
  async (session, results, next) => {
        if (!results.resumed) {
          switch (results.response.entity) {
            case 'Tienda':
              session.userData.tienda = 'Tienda'
              session.beginDialog('/reclamo_tienda')
              break
            case 'Internet':
              session.userData.tienda = 'Internet'
              session.beginDialog('/reclamo_internet_fono')
              break
            case 'Fono Compra':
              session.userData.tienda = 'Fono-Compras'
              session.beginDialog('/reclamo_internet_fono')
              break
          }
        } else {
            session.userData.sectionSalida = '/ingreso_reclamo'
            session.beginDialog('/salida')
        }
  }
])*/
bot.dialog('/ingreso_reclamo', [
  (session, args, next) => {
    session.send(botReply.text1)
    session.userData.tienda = 'Internet'
    session.beginDialog('/reclamo_internet_fono')
  }
])