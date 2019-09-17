const botReply = require('./text')
const tiendaService = require('./../../__services/tienda')
const tiendaEntities = require('./../../functions/entities/tienda.js')
const infoTienda = require('./../../functions/infoTienda')

bot.dialog('/horario_tienda', [
  async (session, args, next) => {
    const intentType = await new Promise(async resolve => {
      resolve(await connectionApiLuis.getDataLuis(session.message.text))
    })
    if (intentType != null && intentType.entities != null) {
      const tienda = await tiendaEntities.calcularTiendaPorIntentType(intentType)
      if (tienda != null && tienda.id !== null && typeof(tienda.id) != 'undefined' && tienda.id !== 0 && tienda.gerente !== '' && tienda.gerente !== null) {
        if (tienda.nombre === 'CENTRO') {
          session.userData.tipoTiendaConsulta = 'horario'
          session.beginDialog('/sectionTienda')
          return
        }
        infoTienda.showHorarioTienda(session, tienda)
        //session.send(`${tienda.nombreFantasia} funciona de ${tienda.horarios}.`)
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
      if (tienda != null && tienda.id !== null && typeof(tienda.id) != 'undefined' && tienda.id !== 0 && tienda.gerente !== '' && tienda.gerente !== null) {
        if (tienda.nombre === 'CENTRO') {
          session.userData.tipoTiendaConsulta = 'horario'
          session.beginDialog('/sectionTienda')
          return
        }
        infoTienda.showHorarioTienda(session, tienda)
        //session.send(`${tienda.nombreFantasia} funciona de  ${tienda.horarios}.`)
      } else {
        session.send('¡Lo siento! , no he podido encontrar el nombre del gerente de tienda.')
      }
    } catch (e) {
      //todo : application insight
      session.send('¡Lo siento! , no he podido encontrar el nombre del gerente de tienda.')
    }
    session.endConversation()
  }
])