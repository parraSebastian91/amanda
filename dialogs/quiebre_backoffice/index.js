require('../../functions/ingresoDatos/sectionEndConversation')
const { listaProductosPorOC } = require('../../utils/adaptiveCardImagenesPorOC')
const { AdaptiveCard, transaccionesQuiebres, MensajeDeAyuda } = require('../../utils')
// const { TIPOLOGIA } = require('../informacion_orden_compra/functions')
const logger = require('../../utils/logger')
const { CODIGO, SERVICE } = require('../../utils/control_errores')
const intentLuis = require('../../functions/salidaDinamica')
require('./seccionConfirmar')
require('./giftcard_quiebre')
require('./callback_quiebre')
const text = require('./text')
const tbot_textext = require('./../../bot_text')

function menuop(statusVIP, montoGitf) {
  let op = null
  let quiebre_on_giftcard = (process.env.QUIEBRE_ON_GIFTCARD === 'true')
  let quiebre_on_callback = (process.env.QUIEBRE_ON_CALLBACK === 'true')
  if (statusVIP && quiebre_on_giftcard && quiebre_on_callback) {
    // menu con callback y gift card
    op = { 'opcion': [`Gift Card $${montoGitf}`, 'Llamada Ejecutivo'] }
  } else if (quiebre_on_giftcard && quiebre_on_callback) {
    // solo crear gift card
    op = { 'opcion': [`Gift Card $${montoGitf}`] }
  } else {
    if (quiebre_on_giftcard && !quiebre_on_callback) {
      op = { 'opcion': [`Gift Card $${montoGitf}`] }
    } else if (!quiebre_on_giftcard && quiebre_on_callback) {
      op = { 'opcion': ['Llamada Ejecutivo'] }
    }
  }

  return op
}

bot.dialog('/quiebre_backoffice', [
  async (session, args, next) => {
    logger.info('flujo BO : /quiebre_backoffice')
    try {
      if ('session_userdata' in args) {
        session.userData = args.session_userdata
        session.userData.orderNumber = session.userData.dataPersonal.DatosQuiebre.numeroOrden
        session.userData.orden_compra = session.userData.dataPersonal.DatosQuiebre.numeroOrden
        session.userData.rut = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].customer_number_id_oc
        session.userData.email = session.userData.dataPersonal.DatosQuiebre.emailOrden
        session.userData.statusVIP = session.userData.dataPersonal.DatosQuiebre.usuarioVip
      } else {
        transaccionesQuiebres(session, null, CODIGO.ERROR_APLICACION_SESSION_EMPTY)
        logger.error('Error controlado: /quiebre_backoffice')
        session.beginDialog('/saludos')
      }
      let webtracking = null
      try {
        // Se controla asi para no intervenir el getOrder
        webtracking = await WEBTRACKING.getOrder(session)
      } catch (error) {
        transaccionesQuiebres(session, {
          name: SERVICE.WEBTRACKING,
          request: session.userData,
          response: webtracking
        }, CODIGO.ERROR_SERVICIO)
        session.send('Error en el servicio de Webtracking Intente mas tarde.')
        session.endConversation()
        return;
      }
      if (webtracking.success) {
        session.userData.order = {
          order: webtracking.state
        }
        session.userData.fechaCompra = webtracking.state.created_date
        session.userData.idTicket = webtracking.state.ticket_id
        session.userData.ticketSequence = webtracking.state.ticket_sequence
        session.userData.ticketTerminal = webtracking.state.ticket_terminal
        session.userData.tienda = 'Internet'
        const sku_quiebre = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.allBreakProducts[0].breakProducts[0].sku_break_product
        const filtro_suborden_webtracking = webtracking.state.sub_orders.map((e) => {
          e.products = e.products.filter((e) => {
            return e.sku === sku_quiebre
          })
          return e
        })
        let fechaCompra = webtracking.state.created_date.split('/')
        let fechaCompraOc = fechaCompra[2] + '/' + fechaCompra[1] + '/' + fechaCompra[0]
        // let titulo = 'Este es el detalle de tu orden:'
        let titulo = 'Lamento informarte que tu producto no pasó nuestros controles de calidad, por lo que no será despachado.'
        const productos = listaProductosPorOC(filtro_suborden_webtracking, fechaCompraOc, titulo)
        session.send(AdaptiveCard(session, productos, ''))
        // hacer logica de mensaje dps
        session.send()
        // let dialofoGiftcard = 'Por que eres importante para nosotros te hemos dado de regalo una giftcard por $$amount que podrás usar en tu próxima compra'
        let opGift = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.allOptions[0].options.find(function (e) {
          if (e.option_type.toLocaleLowerCase().trim() === 'giftcard') {
            return e.amount_sku_option;
          }
        });
        // session.send(dialofoGiftcard.replace('$$amount', `$${opGift.amount_sku_option}`))
        // session.send('voy a cosultar las opciones que tiene disponible')
        transaccionesQuiebres(session, {
          name: SERVICE.WEBTRACKING,
          request: session.userData,
          response: webtracking
        }, CODIGO.SUCCES)

        next(menuop(session.userData.statusVIP,opGift.amount_sku_option))
      } else {
        transaccionesQuiebres(session, {
          name: SERVICE.WEBTRACKING,
          request: session.userData,
          response: webtracking
        }, CODIGO.ERROR_SERVICIO)
        session.beginDialog('/end_conversation', { mensaje: tbot_textext.msj_error_general })
        // session.send(tbot_textext.msj_error_general)
        // MensajeDeAyuda(session)
        logger.error('flujo BO: /quiebre_backoffice, error - WebTracking')
        // session.endConversation()
      }
    } catch (error) {
      transaccionesQuiebres(session, {
        name: SERVICE.SERVICIO_BO,
        request: session.userData,
        response: error
      }, CODIGO.ERROR_APLICACION)
      logger.error(`flujo BO: /quiebre_backoffice, ${error}`)
      session.endConversation()
    }
  },
  (session, args) => {
    const menuOptions = args.opcion
    const menuText = 'Porque eres importante para nosotros te ofrecemos lo siguiente:'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button,
      retryPrompt: 'Recuerda que si no ingresas la opción no podemos gestionar tu requerimiento.',
      maxRetries: 1
    })
  },
  async (session, results, next) => {
    if (!results.resumed) {
      let op = results.response.entity.split('$')[0].trim() 
      switch (op) {
        case 'Gift Card':
         // session.beginDialog('/seccionConfirmar', { pathQuiebre: '/giftcard_quiebre', title: text.titulo_giftcard, titleRetry: '¿Debes seleccionar uan OP, Estas seguro que deseas una Giftcard ?' })
         session.beginDialog('/giftcard_quiebre')
          break
        case 'Llamada Ejecutivo':
          // session.beginDialog('/seccionConfirmar', { pathQuiebre: '/callback_quiebre', title: text.titulo_callback, titleRetry: '¿Para poder hablar con un ejecutivo debes confirmar ?' })
          session.beginDialog('/callback_quiebre')
          break
      }
    } else {
      logger.info(`Tomo la opción [results.resumed:  ${results.resumed}]`)
      if (session.userData.statusVIP == false) {
        session.beginDialog('/callback_quiebre')
      } let resultIntent = await intentLuis.dialogIntent(session)
      session.beginDialog(`/${resultIntent}`)
    }
  }
])
