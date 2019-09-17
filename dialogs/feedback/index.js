require('../negativefeedback')
require('../livechat')
const livechat = require('../../utils/liveChat')

// if (session.message.text === "livechat") {
//   global.LiveChat = liveChat(session.message.address)
//   session.beginDialog('/livechat')
// }


bot.dialog('/feedback', [
  (session, response, next) => {
    if (response && response.path_origen_feedback) {
      session.userData.pathOrigenFeedback = response.path_origen_feedback
    }
    if (response && response.path_origen_feedback === '/cambio_fecha_despacho') {
      LiveChat[session.message.address.user.id] = livechat(session.message.address)
      LiveChat[session.message.address.user.id].incommingMenssages.push(response.message)
    }
    const menuOptions = `SI|NO`
    const menuText = '¿Fue útil esta respuesta?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      //maxRetries: 2
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (results.response && results.response.entity) {
      switch (results.response.entity) {
        case 'SI':
          session.endConversation('¡Gracias!')
          break
        case 'NO':
          session.beginDialog('/livechat')
          break
      }
    } else {
      session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
      return
    }
    /* else{
        const intentType = await new Promise(async resolve => {
            resolve(await connectionApiLuis.existsInLUIS(session.message.text))
        })
        session.beginDialog(`/${intentType.toLowerCase()}`)
      }*/
  }
])