const botReply = require('./text')
const tiendaService = require('./../../__services/tienda')
const tiendaEntities = require('./../../functions/entities/tienda.js')
const infoTienda = require('./../../functions/infoTienda')

bot.dialog('/ubicacion_tienda', [
  async (session, args, next) => {
    const intentType = await new Promise(async resolve => {
      resolve(await connectionApiLuis.getDataLuis(session.message.text))
    })

    if (intentType != null && intentType.entities != null) {
      const tienda = await tiendaEntities.calcularTiendaPorIntentType(intentType)
      if (tienda!=null && tienda.id !== null && typeof(tienda.id) != 'undefined' && tienda.id !== 0) {
        if (tienda.nombre === 'CENTRO'){
          session.userData.tipoTiendaConsulta = 'ubicacion'
          session.beginDialog('/sectionTienda')
          return
        }
        infoTienda.showInfoTienda(session, tienda)
        session.endConversation()
        return false
      }
    }
		builder.Prompts.text(session, botReply.text1)
  },
  async (session, results, next) => {
    const intentType = await new Promise(async resolve => {
      resolve(await connectionApiLuis.getDataLuis(session.message.text))
    })
    let tienda = null
    if (intentType != null && intentType.entities != null) {
      tienda = await tiendaEntities.calcularTiendaPorIntentType(intentType)
    }
    if (tienda == null) {
      tienda = await tiendaService.getByName(results.response)
    }
    try {
      if (tienda != null && tienda.id !== null && typeof(tienda.id) != 'undefined' && tienda.id !== 0) {
        if (tienda.nombre === 'CENTRO') {
          session.userData.tipoTiendaConsulta = 'ubicacion'
          session.beginDialog('/sectionTienda')
          return
        }
        infoTienda.showInfoTienda(session, tienda)
      } else
        session.send('¡Lo siento! , no he podido encontrar la tienda.')
    }
    catch(e){
      session.send('¡Lo siento! , no he podido encontrar la tienda.')
    }
    session.endConversation()
  }
])