const botReply = require('./text')
const validacionRut = require('./../../functions/validaciones/rut')
const validationOrder = require('./../../functions/validaciones/order')
const validacionEmail = require('./../../functions/validaciones/email')
require('./../../functions/ingresoDatos/sectionArgs')
require('./../../functions/ingresoDatos/sectionRun')
const intentLuis = require("../../functions/salidaDinamica")

/*El menu queda comentado debido a la solicitud del spring 19 que se pide solo ingresar cn el canal de internet*/

/*  (session, args, next) => {
    session.userData.sectionDialog = ''
    const menuOptions = `Tienda|Internet|Fono Compra`
    const menuText = '¿El reclamo que quieres generar es por alguna situación de Tienda, Internet o Fono Compra?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Tienda':
          session.userData.tienda = 'Tienda'
          next()
          break
        case 'Internet':
          session.userData.tienda = 'Internet'
          next()
          break
        case 'Fono Compra':
          session.userData.tienda = 'Fono-Compras'
          next()
          break
      }
    } else {
      session.userData.sectionSalida = '/ingreso_reclamo'
      session.beginDialog('/salida')
    }
  },*/

bot.dialog('/reclamos_despacho', [
  (session, args, next) => {
    session.userData.sectionDialog = ''
    session.userData.tienda = 'Internet'
    session.userData.email = results.response
    session.userData.nivel1 = 'Despachos'
    session.userData.motivo = ''
    const menuOptions = `Producto Incompleto|Despacho Atrasado|Problema con Transportista`
    const menuText = 'Entiendo, tu solicitud de servicio tiene relación con Despachos ¿Cuál de las siguientes clasificaciones describe mejor tu solicitud de servicio?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      switch (results.response.entity) {
        case 'Producto Incompleto':
          session.userData.nivel2 = 'Falta producto en despacho'
          session.beginDialog('/producto_incompleto')
          break
        case 'Despacho Atrasado':
          session.userData.nivel2 = 'Incumplimiento de fecha'
          session.beginDialog('/despacho_atrasado')
          break
        case 'Problema con Transportista':
          session.userData.nivel2 = 'Problema con el Transportista'
          session.userData.nivel3 = 'Problema con el Transportista'
          session.beginDialog('/problema_transportista')
          break
        case 'Producto no Corresponde':
          session.userData.nivel2 = 'Prod entregado no corresponde'
          session.userData.nivel3 = 'Envío/Retiro Manual - PNC'
          session.beginDialog('/producto_no_corresponde')
          break
      }
    } else {
      let resultIntent = await intentLuis.dialogIntent(session)
      session.beginDialog(`/${resultIntent}`)
      return
    }
    session.beginDialog('/emailDespachoReclamo')
  }
])