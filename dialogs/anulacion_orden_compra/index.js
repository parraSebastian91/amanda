require('./../../functions/ingresoDatos/sectionRun')
require('./../../functions/ingresoDatos/sectionPhone')
require('./../ingreso_reclamo/reclamo_internet_fono/boletas_y_cobros/anulacion_compra')
const botReply = require('./text')
const validarFechaSessionActiva = require("./../../functions/validaciones/fecha").validarFechaSessionActiva
const { limpiaSession } = require("../../utils")

bot.dialog('/anulacion_orden_compra', [
  async (session, args , next) => {
    limpiaSession(session)
    if (!validarFechaSessionActiva(session.userData)) {
      if (!session.userData.dataProgram.rutNoValidoEnOrdenCompra) {
        if (args && args.textDevolucion) {
          session.send(botReply.text3)
        } else {
          session.send(botReply.text2)
        }
      }
      session.beginDialog('/sectionRun')
      next()
    } else {
      session.userData.rut = session.userData.dataPersonal.rutUsuario
      if (args && args.textDevolucion) {
        next({ textDevolucion: true })
      } else {
         next()
      }      
    }
  },  
  //Elimionacion de la solicitud de telefono usuario
  async (session, next) => {
    //session.beginDialog('/anulacion_compra')
    session.beginDialog('/sectionOCEMailReclamoAnulacion')
  }
])