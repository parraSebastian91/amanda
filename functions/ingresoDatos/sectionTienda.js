// *****************************************************************
// *                        Reclamos y Webtracking                 *
// *****************************************************************

const tiendaService = require('./../../__services/tienda')
const maps = require('./../maps')
const tiendaEntities = require('./../entities/tienda.js')
const infoTienda = require('./../infoTienda')

bot.dialog('/sectionTienda', [
  (session, args, next) => {
    //todo, obtener desde sesión o parametro de entrada la info la entity a evaluar. En base a eso armar el menú de abajo con los nombres de las tiendas?
    const menuOptions = `HOMBRE Y TEC|MUJER|NIÑOS E INFANTIL`
    const menuText = 'Tenemos varias tiendas en Ahumada, ¿Cuál deseas conocer?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button
    })
  },
  async (session, results, next) => {
    let nombre_fantasia = ''
    //todo, nombre fantasía debiese ser = a entity
    switch (results.response.entity) {
      case 'HOMBRE Y TEC':
        nombre_fantasia = 'Ahumada Caballeros'
        break
      case 'MUJER':
        nombre_fantasia = 'Ahumada Damas'
        break
      case 'NIÑOS E INFANTIL':
        nombre_fantasia = 'Ahumada Infantil'
        break
    }
    tienda = await tiendaService.getByName(nombre_fantasia)
    if (tienda != null && tienda.id !== null && typeof(tienda.id) != 'undefined' && tienda.id !== 0 && tienda.gerente !== '' && tienda.gerente !== null) {
      switch (session.userData.tipoTiendaConsulta) {
        case 'horario':
          //session.send(`${tienda.nombreFantasia} funciona de ${tienda.horarios}.`)
          infoTienda.showHorarioTienda(session, tienda)
          break
        case 'ubicacion':
          /*
          const adressStore = `Ubicada en ${tienda.calle}.`
          const thumbnailResult = tiendaEntities.generateMap(session, tienda, adressStore)
          session.send(`${tienda.nombreFantasia} se encuentra ubicado en ${tienda.calle} y abre de ${tienda.horarios}.`)
          const reply = new builder.Message(session).addAttachment(thumbnailResult)
          session.send(reply)
          */
          infoTienda.showInfoTienda(session, tienda)
          break
        case 'jefe':
          session.send(`El jefe de ${tienda.nombreFantasia} es ${tienda.jefeServicio} y su correo de contacto es ${tienda.jefeServicioCorreo}.`)
          break
        case 'gerente':
          session.send(`El gerente de ${tienda.nombreFantasia} es ${tienda.gerente}.`)
          break
      }

    } else {
      session.send('¡Lo siento!, no he podido encontrar la tienda.')
    }
    session.userData.tipoTiendaConsulta = ''
    session.endConversation()
  }
])