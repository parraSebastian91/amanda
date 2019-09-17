require('./../../functions/ingresoDatos/sectionEndConversation')
require('./../../functions/ingresoDatos/sectionOCValidadorPalabras')
const validarFechaSessionActiva = require("./../../functions/validaciones/fecha").validarFechaSessionActiva
const { MensajeDeAyuda } = require("../../utils")
const respuestaBot = require('./textos')

bot.dialog('/datos_documentos_tributarios', [
  async (session, args) => {
    switch (args.tipoDocumento){
      case 'boleta':
      session.userData.tipoDocumento = 'boleta'
      break
      case 'notaCredito':
      session.userData.tipoDocumento = 'nota de crédito'
      break
      case'ticket_cambio':
      session.userData.tipoDocumento = 'ticket de cambio'
      break
    }     
    if (validarFechaSessionActiva(session.userData)) {
      session.userData.dialogRetryOC = 1
      session.beginDialog('/sectionOCValidadorPalabras')
    } else {
      session.send(respuestaBot.docTributario_usuario_no_logeado.replace('$TIPODOCUMENTO',session.userData.tipoDocumento))
      session.send(respuestaBot.docTributario_usuario_no_logeado_link.replace('$TIPODOCUMENTO',session.userData.tipoDocumento))
      delete session.userData.tipoDocumento
      session.beginDialog('/end_conversation')
      // MensajeDeAyuda(session)
      // session.endConversation()
    }
  },
  async (session,results, next) => {

    const clienteObtenerDatos = await SIEBEL.datosClientesPorOc(session.userData.orden_compra)
    const rutClienteOc = (typeof clienteObtenerDatos.clienteId != 'undefined') ? clienteObtenerDatos.clienteId.replace('-', '').toLocaleUpperCase().trim() : clienteObtenerDatos.codigo
    const rutClienteSession = session.userData.dataPersonal.rutUsuario.replace('-', '').toLocaleUpperCase().trim()

    if (clienteObtenerDatos.codigo == '001' || rutClienteOc != rutClienteSession) {
      delete session.userData.orden_compra
      delete session.userData.orderNumber
      delete session.userData.tipoDocumento
      session.beginDialog('/end_conversation', { mensaje: respuestaBot.docTributario_orden_no_corresponde_a_usuario })
      // session.send(respuestaBot.docTributario_orden_no_corresponde_a_usuario)
      // MensajeDeAyuda(session)
      // session.endConversation()
    } else {
      next()
    }
  },
  async (session, results, next) => {
    const getOrdenCompra = await WEBTRACKING.getOrderUserAuthenticated(session)
    if (getOrdenCompra.success == true) {
      session.send(respuestaBot.docTributario_copia_documento.replace('$NUMERO_OC', session.userData.orden_compra).replace('$TIPODOCUMENTO',session.userData.tipoDocumento))
    }
    delete session.userData.tipoDocumento
    session.beginDialog('/end_conversation')
    // MensajeDeAyuda(session)
    // session.endConversation()
  }
])

