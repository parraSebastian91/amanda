const botReply = require('./text')
require('../../../../../functions/ingresoDatos/sectionOCEMailReclamoAnulacion')
require('../../../../../functions/ingresoDatos/sectionPhone')

/*require('./../../../../../functions/ingresoDatos/sectionOCEMailReclamoAnulacion')

bot.dialog('/anulacion_compra', [
  (session, args, next) => {
    const menuOptions = `Anulación Compra Parcial|Anulación Compra Total`
    const menuText = 'Ok, ¿Necesitas realizar anulación total o parcial de la compra?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 2
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      //session.userData.requirePayMethod = true
      switch (results.response.entity) {
        case 'Anulación Compra Parcial':
          session.userData.nivel1 = 'Boletas y Cobros'
          session.userData.nivel2 = 'Anulación de compra parcial'
          session.userData.nivel3 = 'Anulación de compra parcial'
          session.beginDialog('/sectionOCEMailReclamoAnulacion')
          break
        case 'Anulación Compra Total':
          session.userData.nivel1 = 'Boletas y Cobros'
          session.userData.nivel2 = 'Anulación de compra total'
          session.userData.nivel3 = 'Anulación de compra total'
          session.beginDialog('/sectionOCEMailReclamoAnulacion')
          break
      }
    } else {
      session.endConversation('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
      session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
    }
  }
])*/

bot.dialog('/anulacion_compra', [
  // async(session, results, next) => {
  //   session.beginDialog('/sectionPhone')
  // },
  async (session, args, next) => {
    //session.beginDialog('/anulacion_compra')
    session.beginDialog('/sectionOCEMailReclamoAnulacion')
  }
])