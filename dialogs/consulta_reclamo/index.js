//RZA 13062018
require('./../../functions/saludos')
require('./sectionPhoneConsultaReclamo')
const validacionTelefono = require('./../../functions/validaciones/telefono.js')
require('./../../functions/ingresoDatos/sectionEndConversation')
const estadosJson = require('./estado_reclamo.json')
const botReply = require('./text')

function validaSS(id_ss) {
  var res = id_ss.split("-")
  if (isNaN(res[0]) == false && isNaN(res[1]) == false) {
    if ((res[0].length + res[1].length) === 12)
      return true
    else
      return false
  } else {
    return false
  }
}

bot.dialog('/consulta_reclamo', [
  (session, args, next) => {
    if (typeof session.userData.ssCallback != 'undefined' && session.userData.ssCallback == 1)
      next()
    else {
      session.userData.dialogRetry = 0
      builder.Prompts.text(session, botReply.text1)
    }
  },
  async (session, results, next) => {
    if (typeof session.userData.ssCallback != 'undefined' && session.userData.ssCallback == 1) {
      next()
    } else {
      var flag = validaSS(results.response)
      if (!flag) {
        builder.Prompts.text(session, botReply.text2)
        session.userData.dialogRetry = 1
      } else {
        session.userData.ss = results.response
        next()
      }
    }
  },
  async (session, results, next) => {
    if (typeof session.userData.ssCallback != 'undefined' && session.userData.ssCallback == 1) {
      next()
    } else {
      if (typeof results.response === 'undefined' || results.response === '') {
        results.response = session.userData.ss
      }

      if (typeof results.response != 'undefined' || results.response !== '') {
        var flag = validaSS(results.response)
        if (!flag) {
          session.endConversation()
          session.beginDialog("/saludos", {
            flag_no_mostrar_saludo: false,
            flag_aumentar_contador: true,
            session_userdata: session.userData
          })
          return
        } else {
          solicitudDetalleObtener = await SIEBEL.solicitudDetalleObtener(results.response)
          if (typeof solicitudDetalleObtener.SolicitudDetalleObtenerOutput != 'undefined' && solicitudDetalleObtener.SolicitudDetalleObtenerOutput != null && solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener != null) {
            var _estado = solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.estado
            var _subEstado = solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.subEstado
            var _nivel3 = solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.nivel3
            var flag = 0
            var _fechaCreacion = solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.fechaCreacion
            //25062018 RZA: Modificación callback para BackOffice
            if (solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.ListaDeActividades != null) {
              var actividades = solicitudDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.ListaDeActividades.Actividades
              actividades.forEach(function (element, index, array) {
                _tipo = element.tipo
                _subTipo = element.subTipo
                //_estado = element.estado
                _contactoCliente = element.contactoCliente
              })

              /* Solo para efectos de prueba mientras esta el campo _contactoCliente por parte de SIEBEL
              _tipo = 'BackOffice'
              _subTipo = 'Contacto Inicial'
              _estado='Asignada'
              _contactoCliente='Sin Contacto / No contesta'
              */

              if (_tipo == 'BackOffice' && '_subTipo' == 'Contacto Inicial' && _estado == 'Asignada' && _contactoCliente == 'Sin Contacto / No contesta') {
                session.userData.callback_backoffice = 1
                const menuOptions = `SI|NO`
                const menuText = botReply.text4
                builder.Prompts.choice(session, menuText, menuOptions, {
                  listStyle: builder.ListStyle.button,
                  maxRetries: 2
                })
              } else {
                //Se agrega llamado al servicio getEstadoTipologias para incumplimiento de fecha jira:SAC-1991
              if (_nivel3 === "Incumplimiento fecha Entrega" || _nivel3 === "Anulación de compra total") {
                const mensaje = await MENSAJES.getEstadoTipologias({
                  n3: _nivel3,
                  estado: _estado,
                  sub_estado: _subEstado
                })
                flag = 1
                let cardText = await mensajeAdaptiveCard(mensaje)
                var msg = new builder.Message(session).addAttachment(cardText)
                //session.send(msg)
                session.beginDialog('/end_conversation', { mensaje: msg })
                // session.send(mensaje)
                // session.endConversation()
              } else {
                estadosJson.forEach(function (element, index, array) {
                  if (element.Estado == _estado && element.subEstado == _subEstado && element.tipologia == _nivel3) {
                    flag = 1
                    session.beginDialog('/end_conversation', { mensaje: element.mensaje })
                    // session.send(element.mensaje)
                    // session.endConversation()
                    return
                  }
                })
              }
                if (flag == 0) {
                  let msg = 'Tu requerimiento ingresado el ' + _fechaCreacion + ' ha sido finalizado. Gracias por preferir Falabella.'
                  session.beginDialog('/end_conversation', { mensaje: msg })
                  // session.send('Tu requerimiento ingresado el ' + _fechaCreacion + ' ha sido finalizado. Gracias por preferir Falabella.')
                  // session.endConversation()
                  return
                  /*
                  var noestado = 0
                  if (_estado == 'Abierto' && _subEstado == 'Asignado') {
                    noestado = 1
                    session.send('Hemos recibido tu solicitud de Servicio con fecha '+_fechaCreacion+'. Estamos gestionando tu requerimiento para darle una pronta solución.')
                    session.endConversation()
                    return
                  }

                  if (_estado == 'Abierto' && _subEstado == 'En proceso') {
                    noestado = 1
                    session.send('Estamos trabajando para dar solución a tu requerimiento . Un ejecutivo especializado se encuentra trabajando en tu caso para darte una pronta solución.')
                    session.endConversation()
                    return
                  }

                  if (_estado == 'Abierto' && _subEstado == 'Resuelta') {
                    noestado = 1
                    session.send('Tu requerimiento ha sido finalizado. Gracias por preferir Falabella.')
                    session.endConversation()
                    return
                  }

                  if (_estado == 'Abierto' && _subEstado == 'Pendiente Gestion Cliente') {
                    noestado = 1
                    session.send('Lamentablemente no nos hemos logrado contactar contigo aún. Hemos enviado información a tu correo para poder continuar con tu solicitud. Te recomiendo revisar los correos no deseados.')
                    session.endConversation()
                    return
                  }

                  if (_estado == 'Cerrada' && _subEstado =='Finalizada') {
                    noestado = 1
                    session.send('Tu requerimiento ingresado el '+_fechaCreacion+' ha sido finalizado.Gracias por preferir Falabella.')
                    session.endConversation()
                    return
                  }

                  if (_estado == 'Cancelada' && _subEstado == 'Anulada') {
                    noestado = 1
                    session.send('Hemos tenido problemas para procesar tu solicitud. Te sugiero volver a generar el requerimiento.')
                    session.endConversation()
                    return
                  }

                  if (noestado == 0) {
                    session.send(botReply.text3)
                    session.endConversation()
                    return
                  }
                  */
                }
              }
            } else {
              //Se agrega llamado al servicio getEstadoTipologias para incumplimiento de fecha jira:SAC-1991
              if (_nivel3 === "Incumplimiento fecha Entrega" || _nivel3 === "Anulación de compra total" || _nivel3 === "Anulación de compra total") {
                const mensaje = await MENSAJES.getEstadoTipologias({
                  n3: _nivel3,
                  estado: _estado,
                  sub_estado: _subEstado
                })
                flag = 1
                let cardText = await mensajeAdaptiveCard(mensaje)
                var msg = new builder.Message(session).addAttachment(cardText)
                session.beginDialog('/end_conversation', { mensaje: msg })
                // session.send(mensaje)
                // session.endConversation()
              } else {
                //05072018 RZA fix consulta reclamo , ss sin actividades
                estadosJson.forEach(function (element, index, array) {
                  if (element.Estado == _estado && element.subEstado == _subEstado && element.tipologia == _nivel3) {
                    session.beginDialog('/end_conversation', { mensaje: element.mensaje })
                    flag = 1
                    // session.send(element.mensaje)
                    // session.endConversation()
                  }
                })
              }
              if (flag == 0) {
                let msg = 'Tu requerimiento ingresado el ' + _fechaCreacion + ' ha sido finalizado. Gracias por preferir Falabella'
                session.beginDialog('/end_conversation', { mensaje: msg })
                // session.send('Tu requerimiento ingresado el ' + _fechaCreacion + ' ha sido finalizado. Gracias por preferir Falabella')
                // session.endConversation()
                return
                /*
                if (_estado == 'Abierto' && _subEstado == 'Asignado') {
                  session.send('Hemos recibido tu solicitud de Servicio con fecha '+_fechaCreacion+'. Estamos gestionando tu requerimiento para darle una pronta solución.')
                  session.endConversation()
                  return
                }
                if (_estado == 'Abierto' && _subEstado == 'En proceso') {
                  session.send('Estamos trabajando para dar solución a tu requerimiento . Un ejecutivo especializado se encuentra trabajando en tu caso para darte una pronta solución.')
                  session.endConversation()
                  return
                }
                if (_estado == 'Abierto' && _subEstado == 'Resuelta') {
                  session.send('Tu requerimiento ha sido finalizado. Gracias por preferir Falabella.')
                  session.endConversation()
                  return
                }
                if (_estado == 'Abierto' && _subEstado == 'Pendiente Gestion Cliente') {
                  session.send('Lamentablemente no nos hemos logrado contactar contigo aún. Hemos enviado información a tu correo para poder continuar con tu solicitud. Te recomiendo revisar los correos no deseados.')
                  session.endConversation()
                  return
                }
                if (_estado == 'Cerrada' && _subEstado == 'Finalizada') {
                  session.send('Tu requerimiento ingresado el '+_fechaCreacion+' ha sido finalizado.Gracias por preferir Falabella.')
                  session.endConversation()
                  return
                }
                if (_estado == 'Cancelada' && _subEstado == 'Anulada') {
                  session.send('Hemos tenido problemas para procesar tu solicitud. Te sugiero volver a generar el requerimiento.')
                  session.endConversation()
                  return
                }
                */
              }
            }
          } else {
            let msg = 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
            session.beginDialog('/end_conversation', { mensaje: msg })
            // session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
            // session.endConversation()
            return
          }
        }
      }
    }
  },
  async (session, results, next) => {
    if (typeof session.userData.ssCallback != 'undefined' && session.userData.ssCallback == 1) {
      const menuOptions = `SI|NO`
      const menuText = botReply.text4
      builder.Prompts.choice(session, menuText, menuOptions, {
        listStyle: builder.ListStyle.button,
        maxRetries: 2
      })
    } else {
      if (results.response.entity == 'SI')
        session.beginDialog('/solicitud_callback')
      else
        next()
    }
    //else
    //next()
  },
  async (session, results, next) => {
    if (typeof session.userData.ssCallback != 'undefined' && session.userData.ssCallback == 1) {
      if (results.response.entity == 'SI') {
        session.beginDialog('/solicitud_callback')
      } else {
        builder.Prompts.text(session, botReply.text7)
        session.beginDialog('/sectionPhoneConsultaReclamo')
      }
    } else {
      builder.Prompts.text(session, botReply.text7)
      session.beginDialog('/sectionPhoneConsultaReclamo')
    }
  },
  async (session, results, next) => {
    builder.Prompts.text(session, botReply.text8)
    session.userData.ssCallback = 0
    session.endConversation()
  }
])

async function mensajeAdaptiveCard(str) {
  return  {
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.0",
      "body": [
        {
          "type": "Container",
          "items": [
            {
              "type": "TextBlock",
              "text": `${str}`,
              //"text": `Desde el año 2012 somos socios fundadores de <span style="color:#aad500; font-weight:bold;">Fundación Reforestemos</span>  y juntos hemos plantando 49.432 árboles nativos. Además este año aportamos  <span style="color:#aad500; font-weight:bold;">5.000 árboles nativos</span> para las zonas más afectadas por los incendios en el sur de Chile.`,
              "wrap": true
            }
          ]
        }
      ]
    }
  }
}

async function mensajeAdaptiveCard(str) {
  return  {
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.0",
      "body": [
        {
          "type": "Container",
          "items": [
            {
              "type": "TextBlock",
              "text": `${str}`,
              //"text": `Desde el año 2012 somos socios fundadores de <span style="color:#aad500; font-weight:bold;">Fundación Reforestemos</span>  y juntos hemos plantando 49.432 árboles nativos. Además este año aportamos  <span style="color:#aad500; font-weight:bold;">5.000 árboles nativos</span> para las zonas más afectadas por los incendios en el sur de Chile.`,
              "wrap": true
            }
          ]
        }
      ]
    }
  }
}
