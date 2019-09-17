const botReply = require('./text')
require('./../feedback')
const validate = require('./../../functions/validaciones/order.js')

bot.dialog('/estado_servicio_tecnico', [
  (session, args, next) => {
    builder.Prompts.text(session, botReply.text1)
  },
  async (session, results, next) => {

    solicitudDetalleObtener = await SIEBEL.solicitudDetalleObtener(results.response)

    if (!solicitudDetalleObtener) {
      session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      session.endConversation()
      return
    }

    console.log('solicitudDetalleObtener')
    console.log(solicitudDetalleObtener)

    const isExist = solicitudDetalleObtener.SolicitudDetalleObtenerOutput
    if (typeof isExist !== 'undefined' && isExist !== null && isExist.SolicitudDetalleObtenerResp.SolicitudDetalleObtener !== null) {
      console.log(solicitudDetalleObtener)

      if (solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.estado === 'Abierto') {
        switch (solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.subEstado) {
          case 'Ingresado':
            session.endConversation('Tu solicitud de servicio técnico se encuentra ingresada.')
            break
          case 'Hacia ST':
            session.endConversation('Tu producto se encuentra en dirección al servicio técnico.')
            break
          case 'En Transito ST':
            session.endConversation('Tu producto ya se encuentra recepcionado en el servicio técnico.')
            break
          case 'Recepcionado ST':
            session.endConversation('Tu producto se encuentra en reparación.')
            break
          case 'Producto Reparado':
            session.endConversation('Tu producto ya se encuentra reparado. Pronto nos contactaremos contigo para coordinar la entrega de producto.')
            break
          case 'Producto Rechazado':
          case 'Prod. Sin Reparacion':
          case 'No Retira Transporte':
            session.endConversation('Para más información diríjase a la tienda de origen.')
            break
          case 'Entrega a Transporte':
            session.endConversation('Estamos enviando tu producto desde el servicio técnico a la tienda Falabella correspondiente para que lo puedas retirar.')
            break
          case 'Recibido por Tienda':
            session.endConversation('Tu producto ya se encuetra diponible para ser retirado en nuestra tienda Falabella.')
            break
          case 'Recibido por Cliente':
            session.endConversation('Ya te hemos entregado el producto reparado. Gracias por preferir Falabella.')
            break
        }
      }

      if (solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.estado === 'Cerrado') {
        switch (solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.subEstado) {
          case 'Recibido por Cliente':
            session.endConversation('Ya te hemos entregado el producto reparado. Gracias por preferir Falabella.')
            break
          case 'No Retirado por Clte':
            session.endConversation('Tu producto ya se encuetra diponible para ser retirado en nuestra tienda Falabella.')
            break
          case 'Cancelado':
            session.endConversation(`Para más información contactar a nuestro servcio de atención al cliente al (600 380 5000)[tel:600 380 5000].`)
            break
          case 'Autoriza Facturacion':
            session.endConversation('Diríjase a la tienda a retirar su producto.')
            break
        }
      }

      session.send(`Estamos gestionando tu solicitud de servicio técnico. Puedes volver a consultarme el avance de tu solicitud en unos días más. ¡Gracias por preferir Falabella!`)
      session.endConversation()
    } else {
      session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      session.endConversation()
    }
  }
])