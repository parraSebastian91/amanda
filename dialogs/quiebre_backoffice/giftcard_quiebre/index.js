require('./../../../functions/ingresoDatos/sectionEndConversation')
const { createGiftcard } = require('../../../__services/quiebres/giftcard')
const { updSelectedOption } = require('../../../__services/quiebres/backoffice')
const { MensajeDeAyuda, transaccionesQuiebres, AdaptiveCard } = require('../../../utils')
const { CODIGO, SERVICE } = require('../../../utils/control_errores')
//const { TIPOLOGIA } = require('./../../../dialogs/informacion_orden_compra/functions')

const logger = require('../../../utils/logger')

async function frcGiftCard(session, respuestaServicioGiftCard) {
  logger.info('frcGiftCard inicio')
  let response = {
    error: [],
    success: []
  }  
  session.userData.nivel1 = 'Consultas Generales'
  session.userData.nivel2 = 'Estado del reclamo'
  session.userData.nivel3 = 'Estado del reclamo'
  session.userData.motivo = ''
  
  let descripcion = 'First Contact Resolution. No se logró crear giftcard. (Error servicio GiftCard)'
  try {
    if (respuestaServicioGiftCard.message.code == 0) {
      descripcion = 'First Contact Resolution, Se creó giftcard.'
    }
    session.userData.currentClientInfo = await new Promise(
      (resolve, reject) => {
        resolve(SIEBEL.getClientInfo(session.userData.rut))
      }
    )
    session.userData.motivo_reclamo = descripcion
    session.userData.numeroSubOrdenFCR = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].sub_order
    session.userData.numeroSSFCR = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].customer_number_id_ss
    //session.userData.numeroSubOrdenFCR = flagDuplicidadSS[0].numeroSubOrden
    //session.userData.numeroSSFCR = flagDuplicidadSS[0].numeroSS
    session.userData.mediopago = await CONTROLLER.obtenerMetodoPago(session, session.userData.orden_compra, session.userData.email)
    let createFCR = await CONTROLLER.createFCR(null, session.userData.currentClientInfo, session)
    if (createFCR.success.length > 0) {
      createFCR.success.forEach(function (result) {
        const clone = Object.assign(result, { ss: session.userData.numeroSSFCR })
        response.success.push(clone)
      })
    } else if (createFCR.error.length > 0) {
      createFCR.error.forEach(function (result) {
        const clone = Object.assign(result, { ss: session.userData.numeroSSFCR })
        response.success.push(clone)
      })
    }
    
  } catch (error) {
    logger.error(`frcGiftCard - createFCR error= ${error}`)
    transaccionesQuiebres(session, {
      name: SERVICE.SERVICIO_GIFTCARD,
      request: session.userData,
      response: `frcGiftCard response= ${error}`
    }, CODIGO.ERROR_SERVICIO)
    response.error.push({
      subOrden: null,
      msg: 'Error al intentar crear FCR, frcGiftCard'
    })
  }
  logger.info(`frcGiftCard createFCR. response= ${response}`)
  transaccionesQuiebres(session, {
    name: SERVICE.SERVICIO_GIFTCARD,
    request: session.userData,
    response: `frcGiftCard response= ${response}`
  }, CODIGO.SUCCES)
  return response
}

bot.dialog('/giftcard_quiebre', [
  async (session, args, next) => {
    session.send(AdaptiveCard(session, terminosBody, ''))
    next({ mntGiftcard: session.userData.dataPersonal.DatosQuiebre.infoQuiebre.allOptions[0].options.filter((e) => e.amount_sku_option > 0) })
  },
  async (session, args, next) => {
    session.userData.dataPersonal.DatosQuiebre.datosGiftcard = args.mntGiftcard[0]
    const menuOptions = ['Sí Acepto', 'No Acepto']
    const menuText = `¿Estás seguro que deseas recibir una Giftcard por $${args.mntGiftcard[0].amount_sku_option}?`
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      retryPrompt: `Por favor selecciona una opción valida`,
      maxRetries: 1
    })
  },
  async (session, args, next) => {
    if (!args.resumed) {
      let quiebre_on_callback = (process.env.QUIEBRE_ON_CALLBACK === 'true')
      if (args.response.entity === 'Sí Acepto') {
        next()
      } else {
        if (quiebre_on_callback) {
          // await updSelectedOption(session.userData.quiebre.ss, 'callback')
          session.beginDialog('/callback_quiebre')
        } else {
          session.beginDialog('/end_conversation')
          // MensajeDeAyuda(session)
          // session.endConversation()
        }
      }
    }
    else {
      let msg = 'Recuerda que si no ingresas la opción no podemos gestionar tu requerimiento.'
      session.beginDialog('/end_conversation', { mensaje: msg })
      // session.send('Recuerda que si no ingresas la opción no podemos gestionar tu requerimiento.')
      // MensajeDeAyuda(session)
      // session.endConversation()
    }
  },
  async (session, args, next) => {
    try {
      const date = new Date()
      const año = date.getFullYear() + 1
      const mes = date.getMonth()
      const dia = date.getDate() - 1
      const body = {
        'agreement': 1,
        'cardType': 1,
        'amount': Number(session.userData.dataPersonal.DatosQuiebre.datosGiftcard.amount_sku_option),
        'expirationDate': `${año}-${(mes <= 9) ? 0 : ''}${mes}-${(dia <= 9) ? 0 : ''}${dia}`,
        'storeId': 1037,
        'dni': session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].customer_number_id_oc,
        'order': Number(session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].purchase_order),
        'subOrder': Number(session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].sub_order),
        'sku': session.userData.dataPersonal.DatosQuiebre.datosGiftcard.sku
      }
      const respuesta = await createGiftcard(body)//###########
      logger.info(`flujo BO: /giftcard_quiebre,createGiftcard=, ${JSON.stringify(respuesta)}`)
      transaccionesQuiebres(session, {
        name: SERVICE.SERVICIO_GIFTCARD,
        request: { body },
        response: respuesta
      }, CODIGO.SUCCES)
      next({ respuesta })
    } catch (error) {
      transaccionesQuiebres(session, {
        name: SERVICE.SERVICIO_GIFTCARD,
        request: { body },
        response: error
      }, CODIGO.ERROR_APLICACION)
      logger.error(`flujo BO: /giftcard_quiebre, ${error}`)
      session.endConversation()
    }
  },
  async (session, args, next) => {
    try {
      if (args.respuesta.message.code === 0) { 
        next({ resp: args.respuesta.giftcards[0], respuesta:args.respuesta})
      } else if (args.respuesta.message.code === 203) {
        let msg = 'Ya tienes una giftcard creada. Puedes revisar tu giftcard digital en tu correo electrónico ó en el siguiente [link]("https://www.falabella.com/falabella-cl/mi-cuenta/ordenes")'
        frcGiftCard(session, args.respuesta)
        session.beginDialog('/end_conversation', { mensaje: msg })
        // MensajeDeAyuda(session)
        // session.send('Ya tienes una giftcard creada. Puedes revisar tu giftcard digital en tu correo electrónico ó en el siguiente [link]("https://www.falabella.com/falabella-cl/mi-cuenta/ordenes")')
        // session.endConversation()
      } else {
        var order = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].purchase_order
        var url = `https://www.falabella.com/falabella-cl/mi-cuenta/ordenes?orden=${order}`
        var text = texto[1].replace('$$link', url)
        frcGiftCard(session, args.respuesta)
        session.beginDialog('/end_conversation', { mensaje: text })
        // MensajeDeAyuda(session)
        // session.send(text)
        // session.endConversation()
      }
    } catch (error) {
      transaccionesQuiebres(session, {
        name: SERVICE.SERVICIO_GIFTCARD,
        request: session.userData,
        response: error
      }, CODIGO.ERROR_APLICACION)
      logger.error(`flujo BO: /giftcard_quiebre, ${error}`)
      session.endConversation()
    }
  },
  async (session, args, next) => {
    try {
      let updSelectedOptionResult = await updSelectedOption(session.userData.dataPersonal.DatosQuiebre.infoQuiebre.allOptions[0].ss, args.resp.sku, args.resp.activationCode, args.resp.id, args.resp.sequenceNumber)
      transaccionesQuiebres(session, {
        name: SERVICE.SERVICIO_GIFTCARD_BACKOFFICE,
        request: `${session.userData.dataPersonal.DatosQuiebre.infoQuiebre.allOptions[0].ss}, ${args.resp.sku}, ${args.resp.authCode}, ${args.resp.id}, ${args.resp.sequenceNumber}`,
        response: updSelectedOptionResult
      }, CODIGO.SUCCES)
      //MensajeDeAyuda(session)
      var order = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].purchase_order
      var url = `https://www.falabella.com/falabella-cl/mi-cuenta/ordenes?orden=${order}`
      var text = texto[0].replace('$$link', url)
      // session.send()
      frcGiftCard(session, args.respuesta)
      session.beginDialog('/end_conversation', { mensaje: `$$limpiarcookie${text.replace('$$args.amount', args.resp.amount)}` })
      // session.endConversation()
    } catch (error) {
      transaccionesQuiebres(session, {
        name: SERVICE.SERVICIO_GIFTCARD_BACKOFFICE,
        request: `${session.userData.dataPersonal.DatosQuiebre.infoQuiebre.allOptions[0].ss}, ${args.resp.sku}, ${args.resp.activationCode}, ${args.resp.id}, ${args.resp.sequenceNumber}`,
        response: error
      }, CODIGO.ERROR_APLICACION)
      logger.error(`flujo BO: /giftcard_quiebre, ${error}`)
      session.endConversation()
    }
  }
]);

const texto = ['Genial. Hemos creado una giftcard por un monto de $$args.amount. Puedes revisar tu giftcard digital en tu correo electrónico o en el siguiente [link]($$link)',
  'Lo siento, ocurrió un error al crear tu Giftcard. Por favor ingresar al siguiente [link]($$link) para intentar nuevamente'];

const terminosBody = [
  {
    'type': 'Container',
    'items': [
      {
        'type': 'TextBlock',
        'text': `<p>Perfecto. Recuerda que al seleccionar esta opción iniciaremos el proceso de devolución de monto de compra original.</p>
                  <p class='ver_detalle_orden_compra' onclick='accionDetalleOrdenCompra(this);' style='cursor:pointer;text-align:center;color:#aad500;font-weight:bold;margin-top:10px;'>Detalle<span>+</span></p>
                  <div style='display:none;'>
                    <img class='mapa_zona_retiro' src='https://chatbotstorageblob.blob.core.windows.net/assets/img/template_giftcard.png' width='150'>
                  </div>`
      }
    ]
  }
]