const botReply = require('./text')
const tiendaService = require('./../../__services/tienda')
const tiendaEntities = require('./../../functions/entities/tienda.js')

bot.dialog('/jefe_tienda', [
  async (session, args, next) => {
      const intentType = await new Promise(async resolve => {
        resolve(await connectionApiLuis.getDataLuis(session.message.text))
      })
      if (intentType != null && intentType.entities != null) {
        const tienda = await tiendaEntities.calcularTiendaPorIntentType(intentType)
        if (tienda != null && tienda.id !== null && typeof (tienda.id) != 'undefined' && tienda.id !== 0 && tienda.jefeServicio !== '' && tienda.jefeServicio !== null) {
          if (tienda.nombre === 'CENTRO') {
            session.userData.tipoTiendaConsulta = 'jefe'
            session.beginDialog('/sectionTienda')
            return
          }
          session.send(`El jefe de ${tienda.nombreFantasia} es ${tienda.jefeServicio} y su correo de contacto es ${tienda.jefeServicioCorreo}.`)
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
        if (tienda != null && tienda.id !== null && typeof (tienda.id) != 'undefined' && tienda.id !== 0 && tienda.jefeServicio !== '' && tienda.jefeServicio !== null) {
          if (tienda.nombre === 'CENTRO') {
            session.userData.tipoTiendaConsulta = 'jefe'
            session.beginDialog('/sectionTienda')
            return
          }
          session.send(`El jefe de ${tienda.nombreFantasia} es ${tienda.jefeServicio} y su correo de contacto es ${tienda.jefeServicioCorreo}.`)
        } else {
          session.send('¡Lo siento! , no he podido encontrar el nombre del jefe de tienda.')
        }
      } catch (e) {
        //todo : application insight
        session.send('¡Lo siento! , no he podido encontrar el nombre del jefe de tienda.')
      }
      session.endConversation()
    }
])