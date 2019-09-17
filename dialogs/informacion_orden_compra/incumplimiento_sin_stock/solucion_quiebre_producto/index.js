require('./../../../../functions/ingresoDatos/sectionEndConversation')
require('./../../../../functions/ingresoDatos/sectionPhone')
const botReply = require('./../../text')
const moment = require('moment')
const { MensajeDeAyuda, AdaptiveCard, transaccionesQuiebres } = require('../../../../utils')
const { TIPOLOGIA } = require('../../functions')
const logger = require('./../../../../utils/logger')
const { listaProductos } = require('./../../../../utils/adaptiveCardImagenes')
const intentLuis = require('../../../../functions/salidaDinamica')
const { CODIGO, SERVICE } = require('../../../../utils/control_errores')

function validaMenu(session) {
    return (session.message.value === undefined && session.userData.flagSiNo === undefined)
}

bot.dialog('/solucion_quiebre_producto', [
    async (session, args, next) => {
        logger.info('Dialogo: solucion_quiebre_producto.')
        let solicitud = session.userData.solicitudesPendientes[0].sub_orden;
        let action = []
        let fechaCompr = session.userData.fechaCompra.split('/')
        fechaCompr = fechaCompr[2] + '/' + fechaCompr[1] + '/' + fechaCompr[0]
        //let textInicial = `Necesitamos comunicarnos contigo por un inconveniente con tu despacho.<br><strong>N° Despacho : ${ solicitud.id }</strong>`
        let textInicial = `<strong>N° Despacho : ${solicitud.id}</strong>`
        //let textFinal = `Fecha de compra : ${ fechaCompr } <br>Es por esto que te ofrezco `
        let textFinal = `Fecha de compra : ${fechaCompr} <br>Ya que lamentablemente no podremos despachar tu compra, te ofrezco `
        let anularText = 'Anulación de Compra'
        let callbackText = 'Contacto con Ejecutivo'
        let anular = {
            'type': 'Action.Submit',
            'title': anularText,
            'data': { 'opcionMenu': anularText }
        }
        let callback = {
            'type': 'Action.Submit',
            'title': callbackText,
            'data': { 'opcionMenu': callbackText }
        }

        if (validaMenu(session)) {
            let flagFlechaBloqueadaCallback = await GENESYS.validarBloqueoDiaCallback('FALABELLA_SAC_BO_CH')
            if (!flagFlechaBloqueadaCallback) {
                if (moment().hours() >= 9 && moment().hours() < 21) {
                    action.push(anular)
                    action.push(callback)
                    textFinal += 'las siguientes opciones:'
                } else {
                    action.push(anular)
                    textFinal += 'la siguiente opcion:'
                }
            } else {
                action.push(anular)
                textFinal += 'la siguiente opcion:'
            }
            let productosBody = listaProductos(solicitud, textInicial, textFinal)
            session.userData.flagSiNo = true
            session.send(AdaptiveCard(session, productosBody, action))
        } else {
            let resultado = (session.message.value !== undefined) ? session.message.value.opcionMenu : session.message.text
            session.userData.flagSiNo = false
            next({ resultado })
        }
    },
    async (session, results, next) => {
        if (session.userData.flagSiNo !== undefined && session.userData.flagSiNo === false) {
            if (results.resultado.toLocaleUpperCase() === ('Anulación de Compra').toLocaleUpperCase()) {
                if (session.userData.totalSubOrdenes === session.userData.numSubOrdenesProductosConQuiebre) {
                    // if (session.userData.numSubOrdenesProductos == session.userData.numSubOrdenesProductosConQuiebre) {
                    // Anulación total de orden
                    session.userData.nivel1 = 'Boletas y Cobros'
                    session.userData.nivel2 = 'Generar NC - anulación total'
                    session.userData.nivel3 = 'Generar NC - anulación total'
                } else {
                    // Anulación parcial de orden
                    session.userData.nivel1 = 'Boletas y Cobros'
                    session.userData.nivel2 = 'Generar NC - anulación parcial'
                    session.userData.nivel3 = 'Generar NC - anulación parcial'
                }
                session.userData.orderNumber = session.userData.orden_compra
                let getPaymentMethods = await WEBTRACKING.getPaymentMethod(session)
                if (getPaymentMethods.success && getPaymentMethods.state.type) {
                    session.userData.motivo_reclamo = 'Solicitud de anulación generada por SS de incumplimiento sin stock'
                    session.userData.motivo = 'Arrepentimiento'
                    if (getPaymentMethods.state.type === 'debitPayment') {
                        session.userData.mediopago = 'Tarjeta Débito'
                    } else if (getPaymentMethods.state.type === 'cashPayment') {
                        session.userData.mediopago = 'Efectivo'
                    } else if (getPaymentMethods.state.type === 'creditOrCmrPayment') {
                        if (getPaymentMethods.state.payment_mode === 'CMRCard') {
                            session.userData.mediopago = 'Tarjeta CMR'
                        } else {
                            session.userData.mediopago = 'Tarjeta Crédito'
                        }
                    }
                    let subOrdenCreateSS
                    let descripcion_nota_credito = 'Nota de crédito solicitada por cliente con quiebre a través de Amanda.\nFavor validad con el área de Backoffice.'
                    subOrdenCreateSS = await SIEBEL.CrearNotaCredito(session.userData.solicitudQuiebre, 'BackOffice', 'Gestión de Anulación', descripcion_nota_credito)
                    let botReplyMsg = botReply.message(subOrdenCreateSS.crearNC, session.userData.solicitudQuiebre.numeroSS)
                    let reclamoMsg = botReplyMsg.titulo
                    logger.info(`reclamoMsg= ${JSON.stringify(reclamoMsg)}`)
                    session.beginDialog('/end_conversation', { mensaje: reclamoMsg })
                    // session.send(reclamoMsg)
                    // MensajeDeAyuda(session)
                    // session.endConversation()
                    session.userData.solicitudesPendientes = await TIPOLOGIA.removeElementArray(session.userData.solicitudesPendientes);
                    if (session.userData.solicitudesPendientes.length > 0) {
                        session.beginDialog('/enrutador')
                    } else {
                        session.userData.solicitudesPendientesLength = 1
                        session.userData.solicitudesPendientes = []
                        session.beginDialog('/end_conversation')
                        // MensajeDeAyuda(session)
                        // session.endConversation()
                    }
                } else {
                    session.userData.solicitudesPendientesLength = 1
                    session.userData.solicitudesPendientes = []
                    let msj = 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
                    session.beginDialog('/end_conversation',{ mensaje: msj })
                    // MensajeDeAyuda(session)
                    // session.endConversation()
                }
            } else if (results.resultado.toLocaleUpperCase() === ('Contacto con Ejecutivo').toLocaleUpperCase()) {
                // Generar solicitud de callback o contacto con ejecutivo
                next()
                // session.endConversation('Queremos ayudarte, es por esto que te damos la opción de contactarte con nuestros ejecutivos. Nuestro horario de atención es de 9:00 a 21:00 horas')
            } else {
                let resultIntent = await intentLuis.dialogIntent(session)
                session.beginDialog(`/${resultIntent}`)
                session.endDialog()
            }
        } else {
            let resultIntent = await intentLuis.dialogIntent(session)
            session.beginDialog(`/${resultIntent}`)
            session.endDialog()
        }
    },
    /* async (session, results, next) => {
      session.beginDialog('/sectionPhone')
    }, */
    async (session, results, next) => {
        // Se agrega esta validación para no hacer mas de un callback
        if (session.userData.callbackExist === true) {
            session.endConversation()
        }
        const infoCliente = {
            rut: session.userData.rut,
            phone: session.userData.telefono,
            nombreCtc: 'Amanda Quiebres',
            apellidoCtc: '',
            mailCh: ''
        }

        session.userData.currentClientInfo = await new Promise(
            (resolve, reject) => {
                resolve(SIEBEL.getClientInfo(session.userData.rut))
            }
        )

        let responseCallbackService = await GENESYS.getClienteLlamadaSolicitar(infoCliente, 'FALABELLA_SAC_BO_CH', 'Quiebres')
        if (responseCallbackService) {

            let DatosFCR = session.userData.currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto[0]
            session.userData.nombre = DatosFCR.nombre
            session.userData.apellidoPaterno = DatosFCR.apellidoPaterno
            session.userData.apellidoMaterno = DatosFCR.apellidoMaterno
            session.userData.digitoValidador = DatosFCR.digitoValidador
            session.userData.numeroIdentificacion = DatosFCR.numeroIdentificacion
            session.userData.nacionalidad = DatosFCR.nacionalidad
            session.userData.nivel1 = "Consultas Generales"
            session.userData.nivel2 = "Estado de Orden de Compra"
            session.userData.nivel3 = "Callback Amanda"
            session.userData.estadoF12 = "CANCELADA"
            session.userData.numero = session.userData.telefono

            if (responseCallbackService.response.Body.clienteLlamadaSolicitarExpResp.respMensaje.codigoMensaje == 1) {

                session.userData.descripcion = "Fono = " + session.userData.telefono + " - RUT = " + session.userData.rut + " / Cliente Solicitó CallBack"

                console.log("### FCR de CALLBACK ###")
                const resultCreateSS = await new Promise((resolve, reject) => {
                    const info = SIEBEL.simpleFormatInfo(session.userData)
                    resolve(SIEBEL.simpleCreatesSS(info))
                })

                transaccionesQuiebres(session, {
                    name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_QUIEBRE_PRODUCTO,
                    request: { infoCliente, FALABELLA_SAC_BO_CH, Quiebres },
                    response: responseCallbackService
                }, CODIGO.SUCCES)

                // session.endConversation('Perfecto, un ejecutivo se contactará contigo en unos minutos más.')
                session.send('Perfecto, un ejecutivo se contactará contigo en unos minutos más.')
                session.userData.solicitudesPendientesLength = 1
                session.userData.solicitudesPendientes = []
                // session.userData.solicitudesPendientes = await TIPOLOGIA.removeElementArray(session.userData.solicitudesPendientes);
                // if (session.userData.solicitudesPendientes.length > 0) {
                //   session.beginDialog('/enrutador')
                // }
                session.beginDialog('/end_conversation')
                // session.endConversation()
            } else {

                session.userData.descripcion = "Fono = " + session.userData.telefono + " - RUT = " + session.userData.rut + " / Cliente solicita CallBack. CallBack Fallido"

                console.log("### FCR de CALLBACK ###")
                const resultCreateSS = await new Promise((resolve, reject) => {
                    const info = SIEBEL.simpleFormatInfo(session.userData)
                    resolve(SIEBEL.simpleCreatesSS(info))
                })

                transaccionesQuiebres(session, {
                    name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_QUIEBRE_PRODUCTO,
                    request: { infoCliente, FALABELLA_SAC_BO_CH, Quiebres },
                    response: responseCallbackService
                }, CODIGO.ERROR_SERVICIO)
                logger.error(`/callback_quiebre_producto`)

                logger.error('Ha ocurrido un inconveniente. Por favor inténtelo nuevamente.')
                session.endConversation('Ha ocurrido un inconveniente. Por favor inténtelo nuevamente.')
            }
        } else {
            session.error('Ha ocurrido un inconveniente. Por favor inténtelo nuevamente.')
            session.endConversation('Ha ocurrido un inconveniente. Por favor inténtelo nuevamente.')
        }
    }
])