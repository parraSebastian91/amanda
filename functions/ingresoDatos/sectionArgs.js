// *****************************************************************
// *                        Solo para reclamos                     *
// *****************************************************************
// const builder = require('botbuilder')
// require('./sectionFormularioCambioBoleta')
// const botReply = require('./text')
require('./sectionEndConversation')
const moment = require('moment')
const mensajesCreacionSSTipologiaNivel3 = require('./mensajesCreacionSSTipologiaNivel3.json')
const { MensajeDeAyuda, limpiaSession, transaccionesQuiebres, AdaptiveCard, OfuscarCorreo } = require('../../utils')
const botReply = require('./text')
const logger = require('./../../utils/logger')
const { CODIGO, SERVICE } = require('./../../utils/control_errores')

const MENSAJE_CORREO = 'Te hemos enviado un respaldo de tu solicitud al correo: {{correo}}'

function validarSubOrdenEstadoEnRuta(macroStepsArray) {
  var result = macroStepsArray.filter(function (e) {
    return e.status === 'Orden entregada' || e.status === 'Orden en camino'
  })
  return (!result.length > 0)
}

function tipologias(userData) {
  if (userData.AnulacionGaratiaExtendida) {
    return 'Anulacion garantia extendida'
  } else if (userData.SolicitudGaratiaExtendida) {
    return 'Solicitud garantia extendida'
  } else {
    return userData.nivel3
  }
}

bot.dialog('/sectionArgs', [
  async function (session, args, next) {
    let num_subordenes = session.userData.checkBoxOrdersSelected.length
    let array_num_subordenes_con_ss_duplicadas = []
    let lista_duplicidad_ss = []
    let lista_string_ss_creadas = ''
    for (let numero_suborden of session.userData.checkBoxOrdersSelected) {
      const flagDuplicidadSS = await SIEBEL.calcularSolicitudListadoObtener(
        session.userData.rut,
        session.userData.orderNumber,
        numero_suborden,
        session.userData.nivel3
      )

      lista_duplicidad_ss = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(
        session.userData.rut,
        session.userData.orderNumber,
        numero_suborden,
        session.userData.nivel3)

      if (flagDuplicidadSS) {
        array_num_subordenes_con_ss_duplicadas.push(numero_suborden)
        lista_string_ss_creadas = (array_num_subordenes_con_ss_duplicadas.length === 1) ? '<br>&bull;&nbsp;' + lista_duplicidad_ss[0].numeroSS + '.' : lista_string_ss_creadas + '<br>&bull;&nbsp;' + lista_duplicidad_ss[0].numeroSS + '.'
      }
    }

    if (num_subordenes === array_num_subordenes_con_ss_duplicadas.length) {
      if (num_subordenes === 1) {
        if (session.userData.nivel3 === 'Solicitud de armado') {
          session.userData.isArmado = false
          session.beginDialog('/end_conversation', { mensaje: botReply.sectionArgs_ya_tienes_ss_creada.replace('$LISTASSCREADA', lista_string_ss_creadas) })
          // session.endConversation()
          // MensajeDeAyuda(session)
        } else if (session.userData.nivel3 === 'Incumplimiento fecha Entrega') {
          session.beginDialog('/end_conversation', { mensaje: botReply.sectionArgs_ya_tienes_ss_despacho_creada.replace('$LISTASSCREADA', lista_string_ss_creadas) })
          // session.endConversation()
          // MensajeDeAyuda(session)
        } else {
          session.beginDialog('/end_conversation', { mensaje: botReply.sectionArgs_ya_tienes_una_ss_por_este_motivo.replace('$LISTASSCREADA', lista_string_ss_creadas) })
          // session.endConversation()
          // MensajeDeAyuda(session)
        }
      } else {
        if (session.userData.nivel3 === 'Solicitud de armado') {
          session.beginDialog('/end_conversation', { mensaje: botReply.sectionArgs_ya_tienes_ss_creadas.replace('$LISTASSCREADA', lista_string_ss_creadas) })
          session.userData.isArmado = false
          // session.endConversation(botReply.sectionArgs_ya_tienes_ss_creadas.replace('$LISTASSCREADA', lista_string_ss_creadas))
          // MensajeDeAyuda(session)
        } else if (session.userData.nivel3 === 'Incumplimiento fecha Entrega') {
          session.beginDialog('/end_conversation', { mensaje: botReply.sectionArgs_ya_tienes_ss_de_despachos_creadas.replace('$LISTASSCREADA', lista_string_ss_creadas) })
          // session.endConversation(botReply.sectionArgs_ya_tienes_ss_de_despachos_creadas.replace('$LISTASSCREADA', lista_string_ss_creadas))
          // MensajeDeAyuda(session)
        } else {
          session.beginDialog('/end_conversation', { mensaje: botReply.sectionArgs_ya_tienes_ss_por_este_motivo.replace('$LISTASSCREADA', lista_string_ss_creadas) })
          // session.endConversation(botReply.sectionArgs_ya_tienes_ss_por_este_motivo.replace('$LISTASSCREADA', lista_string_ss_creadas))
          // MensajeDeAyuda(session)
        }
      }
      return
    } else {
      for (let numero_suborden_con_ss_duplicada of array_num_subordenes_con_ss_duplicadas) {
        session.userData.checkBoxOrdersSelected = session.userData.checkBoxOrdersSelected.filter(function (item) {
          return item !== numero_suborden_con_ss_duplicada
        })
        if (session.userData.nivel3 === 'Solicitud de armado') {
          let msg = `Estimado cliente, ya tienes una solicitud de armado ingresada para el despacho Nº: ${lista_string_ss_creadas}. Un ejecutivo se contactará contigo para coordinar el armado`
          session.beginDialog('/end_conversation', { mensaje: msg })
          // session.send(`Estimado cliente, ya tienes una solicitud de armado ingresada para el despacho Nº: ${lista_string_ss_creadas}. Un ejecutivo se contactará contigo para coordinar el armado`)
          // MensajeDeAyuda(session)
          // session.endConversation()
          return
        } else if (session.userData.nivel3 === 'Incumplimiento fecha Entrega') {
          // session.send(`Estimado cliente, ya tienes una solicitud ingresada por el inconveniente con tu despacho Nº: ${lista_string_ss_creadas}. Tu caso es muy importante para nosotros, es por eso que seguimos gestionando una pronta solución`)
          session.beginDialog('/end_conversation', { mensaje: botReply.sectionArgs_ya_tienes_ss_despacho_creada.replace('$LISTASSCREADA', lista_string_ss_creadas) })
          // session.send(botReply.sectionArgs_ya_tienes_ss_despacho_creada.replace('$LISTASSCREADA', lista_string_ss_creadas))
          // MensajeDeAyuda(session)
          // session.endConversation()
          return
        } else {
          let msg = `Estimado cliente, ya tienes una solicitud ingresada por este motivo.<br>El número de seguimiento es:<br><br>${lista_string_ss_creadas}<br><br>Tus casos son muy importante para nosotros, es por eso que seguimos gestionando una pronta solución`
          session.beginDialog('/end_conversation', { mensaje: msg })
          // session.send(`Estimado cliente, ya tienes una solicitud ingresada por este motivo.<br>El número de seguimiento es:<br><br>${lista_string_ss_creadas}<br><br>Tus casos son muy importante para nosotros, es por eso que seguimos gestionando una pronta solución`)
          // MensajeDeAyuda(session)
          // session.endConversation()
          return
        }
      }
    }

    if (session.userData.nivel3 === 'Incumplimiento fecha Entrega') {
      const getOrder = await WEBTRACKING.getOrder(session)
      if (getOrder.success) {
        if (moment() < moment(getOrder.state.sub_orders[0].delivery_status.date, 'YYYY/MM/DD')) {
          let fecha_compromiso_despacho = moment(getOrder.state.sub_orders[0].delivery_status.date, 'YYYY/MM/DD').format('DD/MM/YYYY')
          let msg = `Estimado cliente, tu despacho está agendado para el día ${fecha_compromiso_despacho}, por lo que no podemos ingresar tu solicitud de despacho atrasado. Recuerda que puedes hacer el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)`
          session.beginDialog('/end_conversation', { mensaje: msg })
          // MensajeDeAyuda(session)
          // session.endConversation(`Estimado cliente, tu despacho está agendado para el día ${fecha_compromiso_despacho}, por lo que no podemos ingresar tu solicitud de despacho atrasado. Recuerda que puedes hacer el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)`)
        } else {
          next()
        }
      } else {
        session.beginDialog('/end_conversation', { mensaje: botReply.sectionArgs_error_consultar_datos_oc })
        // session.send(botReply.sectionArgs_error_consultar_datos_oc)
        // session.endConversation()
      }
    } else {
      next()
    }
    /* else if (session.userData.nivel3 == 'FC / NC Administrativa') {
      session.userData.sendFormRetry = 1
      session.beginDialog('/sectionFormularioCambioBoleta')
    } */
  },
  async (session, results, next) => {
    const msgError = validatePromptsText(botReply.sectionArgs_motivo_no_valido, session, 3)

    if (msgError) {
      if (session.userData.retryDialog === 0) {
        if (session.userData.isArmado === undefined || session.userData.isArmado === false) {
          builder.Prompts.text(session, botReply.sectionArgs_ultimo_poso_describe)
        } else {
          builder.Prompts.text(session, botReply.sectionArgs_ultimo_poso_describe_armado_mueble)
        }
      } else {
        builder.Prompts.text(session, botReply.sectionArgs_descripcion_corta)
      }
    }
  },
  async (session, results, next) => {
    if (results.response.length >= 10) {
      /*
      if (session.userData.nivel3 == 'FC / NC Administrativa') {
        session.userData.motivo_reclamo = `Datos de facturación:`
        session.userData.motivo_reclamo += `\nRUT empresa: ${session.userData.dataExtraFormulario.rut_empresa}`
        session.userData.motivo_reclamo += `\nRazón social: ${session.userData.dataExtraFormulario.razon_social}`
        session.userData.motivo_reclamo += `\nGiro: ${session.userData.dataExtraFormulario.giro}`
        session.userData.motivo_reclamo += `\nDirección empresa: ${session.userData.dataExtraFormulario.direccion_empresa}`
        session.userData.motivo_reclamo += `\nRegión: ${session.userData.dataExtraFormulario.region_direccion_empresa}`
        session.userData.motivo_reclamo += `\nComuna: ${session.userData.dataExtraFormulario.comuna_direccion_empresa}`
        session.userData.motivo_reclamo += `\nEmail empresa: ${session.userData.dataExtraFormulario.email_empresa}`
        session.userData.motivo_reclamo += `\nTeléfono empresa: ${session.userData.dataExtraFormulario.telefono_empresa}`
        session.userData.motivo_reclamo += `\nSolicitado por: ${session.userData.dataExtraFormulario.nombre_apellido_solicitante}`
        session.userData.motivo_reclamo += `\nNúmero de contacto callback: ${session.userData.telefono}`
        session.userData.motivo_reclamo += `\n\n${results.response}`
      }
      else */
      if (session.userData.nivel3 === 'Incumplimiento fecha Entrega') {
        session.userData.motivo_reclamo = results.response
        if (typeof session.userData.flagTotalEntregaFalso !== 'undefined' && session.userData.flagTotalEntregaFalso) {
          session.userData.motivo_reclamo += '\n Posible Total Entrega Falso'
          session.userData.motivo_reclamo += '\n SS ingresada por Ingreso de Solicitud.'
          session.userData.flagTotalEntregaFalso = false
        } else {
          session.userData.motivo_reclamo += '\n SS ingresada por Ingreso de Solicitud.'
        }

        // se comenta de flujo fecha 21-01-2019, historis SAC-905
        // session.userData.motivo_reclamo += `\nNúmero de contacto callback: ${session.userData.telefono}`
      } else {
        session.userData.motivo_reclamo = results.response
      }
      // if(session.userData.nivel3 == 'Envío/Retiro Manual - PNC')
      if (typeof session.userData.order.order.anulacion_subOrden !== 'undefined') {
        session.userData.motivo_reclamo += ' (SS de anulacion creada por amanda, favor verificar datos.)'
      }
      if (session.userData.AnulacionGaratiaExtendida) {
        session.userData.motivo_reclamo = results.response + botReply.sectionArgs_validar_con_cliente_anulacion_gatex
      }
      if (session.userData.SolicitudGaratiaExtendida) {
        session.userData.motivo_reclamo = results.response + ' Solicitud de USO Garantía Extendida desde Amanda. Favor validar con cliente titular'
      }
      if (!session.userData.motivo) {
        session.userData.motivo = ''
      }
      // console.log(session.userData.motivo_reclamo)
      logger.info(session.userData.motivo_reclamo)
      next()
    } else {
      session.userData.retryDialog += 1
      session.replaceDialog('/sectionArgs', {
        reprompt: true
      })
    }
  },
  async (session, results, next) => {
    let ordersArray = []
    ordersArray = session.userData.checkBoxOrdersSelected


    const currentClientInfo = await new Promise((resolve, reject) => {
      resolve(SIEBEL.getClientInfo(session.userData.rut))
    })
    let subOrdenCreateSS = null
    if (session.userData.nivel3 === 'Incumplimiento fecha Entrega' && typeof session.userData.subOrders[0].store !== 'undefine') {
      session.userData.nivel1 = 'Despachos'
      session.userData.nivel2 = 'Consulta de Despacho/Retiro'
      session.userData.nivel3 = 'Estado del Despacho/Retiro'
      session.userData.motivo_reclamo = session.userData.motivo_reclamo.replace('SS', 'FCR')
      subOrdenCreateSS = await CONTROLLER.createFCR(ordersArray, currentClientInfo, session)
    } else {
      subOrdenCreateSS = await CONTROLLER.subOrdenCreateSS(ordersArray, currentClientInfo, session)
    }

    logger.info(ordersArray)
    logger.info(currentClientInfo)
    // console.log(ordersArray)
    // console.log(currentClientInfo)

    //    subOrdenCreateSS = await CONTROLLER.subOrdenCreateSS(ordersArray, currentClientInfo, session)

    if (session.userData.nivel3 === 'Incumplimiento fecha Entrega') {
      if (subOrdenCreateSS.success.length > 0) {

        transaccionesQuiebres(session, {
          name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
          request: { ordersArray, 'Contacto': currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto, session },
          response: subOrdenCreateSS
        }, CODIGO.SUCCES)

      } else if (subOrdenCreateSS.error.length > 0) {

        transaccionesQuiebres(session, {
          name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
          request: { ordersArray, 'Contacto': currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto, session },
          response: `crea_SS_incumplimiento_fecha_entrega response= ${JSON.stringify(subOrdenCreateSS)}`
        }, CODIGO.ERROR_APLICACION)
        logger.error(`flujo sectionARGS: /creaSSIncumplimientoFecha, ${subOrdenCreateSS.error}`)

      }
    }
    /*
    let botReplyMsg = botReply.message(session.userData.nivel3)
    let reclamoMsg = (subOrdenCreateSS.success.length == 0) ? '' : botReplyMsg.titulo
    */

    // 23-01-2019 - se modifica flujo de mensajes creación o errores
    //
    let ssReclamoCreado = ''
    let count = 0
    let ssReclamoNoCreado = ''
    subOrdenCreateSS.success.forEach(obj => {
      ssReclamoCreado = (subOrdenCreateSS.success.length === 1) ? '<br>&bull;' + obj.msg + '.' : ssReclamoCreado + '<br> &bull;' + obj.msg + '.'
      count++
    })
    subOrdenCreateSS.error.forEach(obj => {
      ssReclamoNoCreado = (subOrdenCreateSS.error.length === 1) ? '<br>&bull;&nbsp;' + obj.subOrden + '.' : ssReclamoNoCreado + '<br> &bull;' + obj.msg + '.'
    })
    const tipologia = tipologias(session.userData)

    if (subOrdenCreateSS.error.length > 0) {
      let mensajeNoCreadaSS = ''
      if (subOrdenCreateSS.error.length === 1) {
        mensajeNoCreadaSS = botReply.sectionArgs_no_registra_ss + ssReclamoNoCreado + '<br>' + subOrdenCreateSS.error[0].msg
      } else {
        mensajeNoCreadaSS = botReply.sectionArgs_no_registra_varias_ss.replace('$SSRECLAMONOCREADO', ssReclamoNoCreado)
      }
      limpiaSession(session)
      session.send(mensajeNoCreadaSS)
    }

    // fix async
    if (subOrdenCreateSS.success.length > 0) {
      let mensajeSsCreada = ''
      if (count === 0) {
        var msgGenerico = mensajesCreacionSSTipologiaNivel3.find(function (e) {
          return e.tipologia === ''
        })
        mensajeSsCreada += '&bull;' + msgGenerico.mensaje.replace('$ID_SOLICITUD', ssReclamoCreado) + '.'

        if (mensajeSsCreada === "") {
          var msgGenerico = mensajesCreacionSSTipologiaNivel3.find(function (e) {
            return e.tipologia === ''
          })
          mensajeSsCreada += '&bull;' + msgGenerico.mensaje.replace('$ID_SOLICITUD', ssReclamoCreado) + '.'
        }
      } else if (count > 1) {
        if (session.userData.order.order.anulacion_subOrden) {
          mensajeSsCreada = botReply.sectionArgs_crea_ss_anulacion.replace('$SSRECLAMOCREADO', ssReclamoCreado)
        } else {
          mensajeSsCreada = botReply.sectionArgs_crea_ss_reclamo.replace('$SSRECLAMOCREADO', ssReclamoCreado)
        }
        if (mensajeSsCreada === "") {
          var msgGenerico = mensajesCreacionSSTipologiaNivel3.find(function (e) {
            return e.tipologia === ''
          })
          mensajeSsCreada += '&bull;' + msgGenerico.mensaje.replace('$ID_SOLICITUD', ssReclamoCreado) + '.'
        }
      } else if (count === 1) {
        mensajesCreacionSSTipologiaNivel3.forEach(function (element) {
          if (element.tipologia === tipologia) {
            mensajeSsCreada += '&bull;' + element.mensaje.replace('$ID_SOLICITUD', ssReclamoCreado) + '<br>'
            count++
          }
        })
        if (mensajeSsCreada === "") {//Fix Historia SAC-1842
          var msgGenerico = mensajesCreacionSSTipologiaNivel3.find(function (e) {
            return e.tipologia === ''
          })
          mensajeSsCreada += '&bull;' + msgGenerico.mensaje.replace('$ID_SOLICITUD', ssReclamoCreado) + '.'
        }
      }

      mensajeSsCreada += '<br>' + MENSAJE_CORREO.replace('{{correo}}', OfuscarCorreo(session.userData.email)) + '.'

      logger.info(`crearMensaje mensajeSsCreada: ${mensajeSsCreada}`)
      limpiaSession(session)
      session.send(mensajeSsCreada)

      if (session.userData.ingresoPor == 'Ingreso Solicitud') {
        const url = 'https://chatbotstorageblob.blob.core.windows.net/assets/img/consulta_solicitud.gif'
        const body = [
          {
            'type': 'ColumnSet',
            'columns': [
              {
                'type': 'Column',
                'width': 'auto',
                'items': [
                  {
                    "type": "TextBlock",
                    "text": "Recuerda que puedes realizar el seguimiento de tu caso ingresando en Amanda; Botón Servicios Postventa --> Consulta Solicitud"
                  },
                  {
                    'type': 'Image',
                    'url': url
                  }
                ]
              }
            ]
          }
        ]
        const action = [
          {
            'type': 'Action.OpenUrl',
            'id': 'ampliar-imagen',
            'title': 'Ampliar imagen',
            'url': url
          }
        ]
        const reply = AdaptiveCard(session, body, action)
        session.send(reply)
      }



    }
    //
    // 23-01-2019 -----------------------------------------------

    /*
    if (subOrdenCreateSS.success.length > 0) {
      if (session.userData.nivel3 != 'FC / NC Administrativa' && session.userData.nivel3 != 'Incumplimiento fecha Entrega') {
        reclamoMsg += '<br> ' + botReplyMsg.pie
      }
    }
    */
    let subOrdens = []
    session.userData.orderNumber = session.userData.orden_compra
    for (const iterator of session.userData.checkBoxOrdersSelected) {
      let subOrdensConMacroStep = session.userData.order.order.sub_orders.filter(function (e) {
        return e.id === iterator
      })
      subOrdens.push(subOrdensConMacroStep[0])
    }

    let subOrdenOMS = []
    if (subOrdens.length > 0) {
      subOrdens.forEach(function (e) {
        if (e.macro_steps) {
          if (validarSubOrdenEstadoEnRuta(e.macro_steps)) {
            subOrdenOMS.push(e.id)
          }
        } else {
          logger.info('la sub orden notiene ingresado los macro_steps')
          // console.log('la sub orden notiene ingresado los macro_steps')
        }
      })
    } else {
      logger.info('no se encontraron subordenes para validar datos en el cancel request')
      // console.log('no se encontraron subordenes para validar datos en el cancel request')
    }
    if (subOrdenCreateSS.success.length > 0 && subOrdenOMS.length > 0 && session.userData.nivel3 === 'Anulación de compra total') {
      await CONTROLLER.cancelRequestSubOrders(subOrdenCreateSS.success, session.userData.order.order.id, subOrdenOMS, session.userData.nivel3).then(r => {
        logger.info('#Cancel Request#')
        logger.info(JSON.stringify(r, null, 2))
      })
      //MensajeDeAyuda(session)
    }
    limpiaSession(session)
    //session.endConversation()

    switch (session.userData.nivel3) {
      case 'Solicitud de armado':
      case 'Anulación de compra parcial':
      case 'Anulación de compra total':
      case 'Incumplimiento fecha Entrega':
        break
      default:
        //MensajeDeAyuda(session)
        break
    }
    //session.endConversation()
    session.beginDialog('/end_conversation')
    // if (session.userData.nivel3 == 'FC / NC Administrativa' || session.userData.nivel3 == 'Incumplimiento fecha Entrega') {
    /**
     * Se comenta opción de generar callback en caso de cambio de boleta por factura
     * Historia de Usuario: https://jira.adessa.cl/browse/SAC-269
     * 17/10/2018
     */
    /*
    if (session.userData.nivel3 == 'FC / NC Administrativa') {
      let flagFlechaBloqueadaCallback = await GENESYS.validarBloqueoDiaCallback('FALABELLA_SAC_BO_CH')
      if (!flagFlechaBloqueadaCallback) {
        if (moment().hours() >= 9 && moment().hours() < 21) {
          session.userData.ssAsociada = subOrdenCreateSS.success[0].msg.trim()
          session.beginDialog('/ejecutarCallback')
        } else {
          session.endConversation('Queremos ayudarte, es por esto que te damos la opción de contactarte con nuestros ejecutivos. Nuestro horario de atención es de 9:00 a 21:00 horas')
        }
      } else {
        session.endConversation()
      }
    } else {
      session.endConversation()
    }
    */
  },
  async (session, results, next) => {
    //MensajeDeAyuda(session)
  }
])
/*
bot.dialog('/ejecutarCallback', [
  (session, args, next) => {
    const menuOptions = `SI|NO`
    const menuText = '¿Deseas que te contacte un ejecutivo?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      maxRetries: 0
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      if (results.response.entity && results.response.entity == 'SI') {
        let _info
        if (session.userData.ssAsociada && session.userData.ssAsociada != null) {
          _info = {
            rut: session.userData.rut,
            phone: session.userData.telefono,
            nombreCtc: '',
            apellidoCtc: '',
            ss: session.userData.ssAsociada,
            mailCh: ''
          }
        } else {
          _info = {
            rut: session.userData.rut,
            phone: session.userData.telefono,
            nombreCtc: '',
            apellidoCtc: '',
            mailCh: ''
          }
        }
        let responseCallbackService = ''
        if (session.userData.nivel3 == 'FC / NC Administrativa') {
          responseCallbackService = await GENESYS.getClienteLlamadaSolicitar(_info, 'FALABELLA_SAC_BO_CH', 'Soporte Amanda')
        }

        if (responseCallbackService) {
          if (responseCallbackService.response.Body.clienteLlamadaSolicitarExpResp.respMensaje.codigoMensaje == 1) {
            session.endConversation('Un ejecutivo se contactará contigo a la brevedad.')
          } else {
            session.endConversation('Ha ocurrido un error. Por favor inténtelo nuevamente.')
          }
        } else {
          session.endConversation('Ha ocurrido un error. Por favor inténtelo nuevamente.')
        }
      } else {
        session.endConversation()
      }
    } else {
      session.endConversation()
    }
  }
])
*/
