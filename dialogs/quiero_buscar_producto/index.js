bot.dialog('/quiero_buscar_producto', [
  async (session, args, next) => {
    const text = _.get(session, 'message.text')
    const dataLuis = await connectionApiLuis.getDataLuis(text)
    const entities = _.get(dataLuis, 'entities')
    const product = _.find(entities, {
      type: 'producto'
    })

    if (!product) {
      session.endConversation('No encontré tu producto')
      session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
      return
    }
    const productName = _.get(product, 'entity')

    const msg = `Mira, encontré estos productos para ti, [haz click](https://www.falabella.com/falabella-cl/search/?Ntt=${productName})`
    session.endConversation(msg)
  }
])