const intentLuis = require("./../../../../functions/salidaDinamica")
require('./producto_danado')
require('./producto_equivocado')
require('./cambio_producto_incompleto')

bot.dialog('/menu_reclamos_producto', [
  async (session, args, next) => {
    const menuOptions = `Producto Incompleto|Producto Dañado|Producto Equivocado`
    const menuText = 'Entiendo que has tenido inconvenientes con tu despacho ¿Me podrías indicar qué situación en específico ocurrió con tu despacho?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Producto Incompleto':
          session.userData.nivel1 = 'Gestión sobre el producto'
          session.userData.nivel2 = 'Producto incompleto'
          session.userData.nivel3 = 'Envío/Retiro Manual - PI'
          session.beginDialog('/cambio_producto_incompleto')
          break
        case 'Producto Dañado':
          session.userData.nivel1 = 'Gestión sobre el producto'
          session.userData.nivel2 = 'Producto con daño estético'
          session.userData.nivel3 = 'Envío/Retiro Manual - PD'
          session.beginDialog('/producto_danado')
          break
        case 'Producto Equivocado':
          session.userData.nivel1 = 'Despachos'
          session.userData.nivel2 = 'Prod entregado no corresponde'
          session.userData.nivel3 = 'Envío/Retiro Manual - PNC'
          session.beginDialog('/producto_equivocado')
          break
      }
    } else {
      let resultIntent = await intentLuis.dialogIntent(session)
      session.beginDialog(`/${resultIntent}`)
      return
    }
  }
])