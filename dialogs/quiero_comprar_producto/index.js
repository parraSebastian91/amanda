const botReply = require('./text')
require('./../../functions/saludos/index')
bot.dialog('/quiero_comprar_producto', [
  async (session, args, next) => {
    // const text = _.get(session, 'message.text')
    // const dataLuis = await connectionApiLuis.getDataLuis(text)
    // const entities = _.get(dataLuis, 'entities')
    // const product = _.find(entities, {
    //   type: 'producto'
    // })

    // if (!product) {
    //   session.endConversation('No encontré tu producto')
    //   session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
    //   return
    // }
    // const productName = _.get(product, 'entity')

    // const msg = `Mira, encontré estos productos para ti, [haz click](https://www.falabella.com/falabella-cl/search/?Ntt=${productName})`
    // session.endConversation(msg)
    session.send(botReply.respuestaVenta)
    session.replaceDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
    //session.endDialog()
    //session.beginDialog('/saludos')
  }
])