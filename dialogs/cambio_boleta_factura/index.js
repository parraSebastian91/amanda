require('./../../functions/ingresoDatos/sectionEndConversation')
require('./../../functions/ingresoDatos/sectionOCValidadorPalabras')
require('./../../functions/ingresoDatos/sectionEmail')
require('./../../functions/ingresoDatos/sectionRun')
require('./../../functions/ingresoDatos/sectionPhone')
require('./../../functions/ingresoDatos/sectionCardList')
require('./../../functions/ingresoDatos/sectionFormularioCambioBoleta')
const botReply = require('./text')
const validarFechaSessionActiva = require('./../../functions/validaciones/fecha').validarFechaSessionActiva
const { validacionRutMailPorOC } = require('./../../functions/validaciones/validaRutMailEnOC')
const { CODIGO, SERVICE } = require('../../utils/control_errores')

// const builder = require('botbuilder');
const moment = require('moment')
const { MensajeDeAyuda, MensajeBuscandoInfo, limpiaSession, transaccionesQuiebres } = require('../../utils')

bot.dialog('/cambio_boleta_factura', [
    async(session, results, next) => {
        limpiaSession(session)
        if (!validarFechaSessionActiva(session.userData)) {
            if (typeof session.userData.rut === 'undefined' || session.userData.rut === '') {
                session.send(botReply.text3)
            }
            session.beginDialog('/sectionRun')
            next()
        } else {
            session.userData.rut = session.userData.dataPersonal.rutUsuario
            next()
        }
    },
    async(session, results, next) => {
        if (validarFechaSessionActiva(session.userData)) {
            session.send(botReply.text3)
        }
        if (typeof session.userData.telefono === 'undefined' || session.userData.telefono === '') {
            if (!results.resumed || results.resumed === 4) {
                session.beginDialog('/sectionPhone')
            } else {
                session.beginDialog('/saludos', {
                    flag_no_mostrar_saludo: false,
                    flag_aumentar_contador: true,
                    session_userdata: session.userData
                })
            }
        }
        next()
    },
    async(session, results, next) => {
        if (!validarFechaSessionActiva(session.userData)) {
            if (typeof session.userData.email === 'undefined' || session.userData.email === '') {
                if (!results.resumed) {
                    session.userData.dialogRetry = 1
                    session.beginDialog('/sectionEmail')
                } else {
                    session.beginDialog('/saludos', {
                        flag_no_mostrar_saludo: false,
                        flag_aumentar_contador: true,
                        session_userdata: session.userData
                    })
                }
            }
            next()
        } else {
            session.userData.email = session.userData.dataPersonal.emailUsuario
            next()
        }
    },
    async(session, results, next) => {
        if (typeof session.userData.orden_compra === 'undefined' || session.userData.orden_compra === '') {
            if (!results.resumed || results.resumed === 4) {
                session.userData.email = (typeof results.response === 'undefined') ? session.userData.dataPersonal.emailUsuario : results.response
                    // session.beginDialog('/sectionOC')
                session.beginDialog('/sectionOCValidadorPalabras')
            } else {
                session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
            }
        }
        next()
    },
    async(session, results, next) => {
        if (!results.resumed) {
            session.userData.orden_compra = results.response
            session.userData.orderNumber = results.response
            next()
        } else if (results.resumed === 4) {
            next()
        } else {
            session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
        }
    },
    async(session, results, next) => {
        MensajeBuscandoInfo(session)
        const datosCliente = await validacionRutMailPorOC(session.userData, true)
        if (!datosCliente.datosOK) {
            session.beginDialog('/end_conversation', { mensaje: datosCliente.mensaje })
            // session.send(datosCliente.mensaje)
            // MensajeDeAyuda(session)
            // session.endConversation()
        } else {
            next()
        }
    },
    async(session, results, next) => {
        session.userData.nivel1 = 'Boletas y Cobros'
        session.userData.nivel2 = 'FC / NC Administrativa'
        session.userData.nivel3 = 'FC / NC Administrativa'
        const getOrder = await WEBTRACKING.getOrder(session)
        const getPaymentMethods = await WEBTRACKING.getPaymentMethod(session)
        if (getOrder.success && getPaymentMethods.success && getPaymentMethods.state.type) {
            const flagDuplicidadSS = await SIEBEL.calcularSolicitudListadoObtenerPorOC(
                session.userData.rut,
                session.userData.orden_compra,
                session.userData.nivel3
            )
            if (flagDuplicidadSS.length != undefined && flagDuplicidadSS.length !== 0 && flagDuplicidadSS[0].SsDuplicada) {
                delete session.userData.orden_compra
                delete session.userData.orderNumber
                session.beginDialog('/end_conversation', { mensaje: botReply.cambioBoletaFactura_solicitud_ya_ingresada.replace('$SSYACREADA', flagDuplicidadSS[0].numeroSS) })
                // MensajeDeAyuda(session)
                // session.endConversation(botReply.cambioBoletaFactura_solicitud_ya_ingresada.replace('$SSYACREADA', flagDuplicidadSS[0].numeroSS))
                return
            }
            var detalleProducts = getOrder.state.sub_orders.map(subOrder => {
                return subOrder.products.map(product => {
                    return {
                        subOrden: subOrder.id,
                        description: product.description,
                        price: product.price,
                        fecha: subOrder.delivery_status.initial_date,
                        image: product.image_url
                    }
                })
            })

            if (detalleProducts) {
                session.userData.infoProductos = detalleProducts
            }

            /* Validación que no hayan pasado 30 días desde la emisión de la boleta */
            const fecha_compra = moment(getOrder.state.created_date, 'YYYY/MM/DD')
            const fecha_limite_cambio_boleta = moment(fecha_compra).add(30, 'days')

            if (moment() <= fecha_limite_cambio_boleta) {
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
                //  const products = getOrder.state.sub_orders[0].products
                session.userData.subOrderNumber = getOrder.state.sub_orders[0].id
                session.userData.fechaCompra = getOrder.state.created_date
                session.userData.idTicket = getOrder.state.ticket_id
                next()
            } else {
                delete session.userData.orden_compra
                delete session.userData.orderNumber
                delete session.userData.telefono
                session.endConversation(botReply.cambioBoletaFactura_no_puede_cambiar_boleta_fecha_mayor_30_dias)
            }
        } else {
            delete session.userData.orden_compra
            delete session.userData.orderNumber
            delete session.userData.telefono

            session.endConversation(botReply.cambioBoletaFactura_inconveniente_al_consultar_datos)
        }
    },
    async(session, results, next) => {
        session.beginDialog('/sectionCardList')
    },
    async(session, results, next) => {
        session.beginDialog('/sectionFormularioCambioBoleta')
    },
    async(session, results, next) => {
        const menuOptions = 'Enviar|Cancelar'
        const menuText = '¿Estás seguro que los datos son correctos? Recuerda que con esta información solicitaremos la factura correspondiente.'
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button
        })
    },
    async(session, results, next) => {
        if (!results.resumed) {
            (results.response.entity === 'Enviar') ? builder.Prompts.text(session, botReply.cambioBoletaFactura_ingreso_descripcion_solicitud): session.beginDialog('/saludos', {
                flag_no_mostrar_saludo: false,
                flag_aumentar_contador: true,
                session_userdata: session.userData
            })
        }
    },
    async(session, results, next) => {
        if (results.response.length >= 10) {
            if (session.userData.nivel3 === 'FC / NC Administrativa') {
                session.userData.motivo_reclamo = 'Datos de facturación:'
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
            if (session.userData.motivo === undefined) {
                session.userData.motivo = ''
            }
        } else {
            console.log('ERROR')
        }
        const currentClientInfo = await new Promise((resolve, reject) => {
            resolve(SIEBEL.getClientInfo(session.userData.rut))
        })
        const contacto = currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto[0]
        session.userData.nombre = contacto.nombre
        session.userData.apellidoMaterno = contacto.apellidoMaterno
        session.userData.apellidoPaterno = contacto.apellidoPaterno
        session.userData.nacionalidad = contacto.nacionalidad
        session.userData.descripcion = session.userData.motivo_reclamo
        const resultCreateSS = await new Promise((resolve, reject) => {
            const info = SIEBEL.simpleFormatInfo(session.userData)
            resolve(SIEBEL.simpleCreatesSS(info))
        })
        if (resultCreateSS.codigo === 0 && resultCreateSS.srNumber !== '') {
            session.send(botReply.cambioBoletaFactura_creacion_solicitud_cambio_boleta.replace('$NUMSSCREACIONSOLICITUD', resultCreateSS.srNumber))
            let flagFlechaBloqueadaCallback = await GENESYS.validarBloqueoDiaCallback('FALABELLA_SAC_BO_CH')
            if (!flagFlechaBloqueadaCallback) {
                if (moment().hours() >= 9 && moment().hours() < 21) {
                    session.userData.ssAsociada = resultCreateSS.srNumber.trim()
                    session.beginDialog('/ejecutarCallback')
                } else {
                    delete session.userData.orden_compra
                    delete session.userData.orderNumber
                    delete session.userData.telefono
                    session.send(botReply.cambioBoletaFactura_ayuda_contacto_ejecutivo)
                    session.endConversation()
                }
            } else {
                session.endConversation()
            }
        } else {
            delete session.userData.orden_compra
            delete session.userData.orderNumber
            delete session.userData.telefono
            session.send(botReply.cambioBoletaFactura_no_registra_solicitud.replace('$OCSESSION', session.userData.orden_compra))
            session.endConversation()
        }
    }
])

bot.dialog('/ejecutarCallback', [
    (session, args, next) => {
        const menuOptions = 'SI|NO'
        const menuText = '¿Deseas que te contacte un ejecutivo?'
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 0
        })
    },
    async(session, results, next) => {
        if (!results.resumed) {
            if (results.response.entity && results.response.entity === 'SI') {
                let _info
                if (session.userData.ssAsociada && session.userData.ssAsociada != null) {
                    _info = {
                        rut: session.userData.rut,
                        phone: session.userData.telefono,
                        nombreCtc: 'Amanda Boleta a Factura',
                        apellidoCtc: '',
                        ss: session.userData.ssAsociada,
                        mailCh: ''
                    }
                } else {
                    _info = {
                        rut: session.userData.rut,
                        phone: session.userData.telefono,
                        nombreCtc: 'Amanda Boleta a Factura',
                        apellidoCtc: '',
                        mailCh: ''
                    }
                }

                session.userData.currentClientInfo = await new Promise(
                    (resolve, reject) => {
                        resolve(SIEBEL.getClientInfo(session.userData.rut))
                    }
                )

                let responseCallbackService = ''
                if (session.userData.nivel3 === 'FC / NC Administrativa') {
                    responseCallbackService = await GENESYS.getClienteLlamadaSolicitar(_info, 'FALABELLA_SAC_BO_CH', 'Soporte Amanda')
                }

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

                    if (responseCallbackService.response.Body.clienteLlamadaSolicitarExpResp.respMensaje.codigoMensaje === 1) {

                        session.userData.descripcion = "Fono = " + session.userData.telefono + " - RUT = " + session.userData.rut + " / Cliente Solicitó CallBack"

                        console.log("### FCR de CALLBACK ###")
                        const resultCreateSS = await new Promise((resolve, reject) => {
                            const info = SIEBEL.simpleFormatInfo(session.userData)
                            resolve(SIEBEL.simpleCreatesSS(info))
                        })

                        transaccionesQuiebres(session, {
                            name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_CAMBIO_BOLETA_FACTURA,
                            request: { _info, FALABELLA_SAC_BO_CH },
                            response: responseCallbackService
                        }, CODIGO.SUCCES)

                        delete session.userData.orden_compra
                        delete session.userData.orderNumber
                        delete session.userData.telefono
                        session.endConversation(botReply.cambioBoletaFactura_contacto_de_ejecutivo)
                    } else {

                        session.userData.descripcion = "Fono = " + session.userData.telefono + " - RUT = " + session.userData.rut + " / Cliente solicita CallBack. CallBack Fallido"

                        console.log("### FCR de CALLBACK ###")
                        const resultCreateSS = await new Promise((resolve, reject) => {
                            const info = SIEBEL.simpleFormatInfo(session.userData)
                            resolve(SIEBEL.simpleCreatesSS(info))
                        })

                        transaccionesQuiebres(session, {
                            name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_CAMBIO_BOLETA_FACTURA,
                            request: { _info, FALABELLA_SAC_BO_CH },
                            response: responseCallbackService
                        }, CODIGO.ERROR_SERVICIO)
                        logger.error(`/callback_cambio_boleta_factura`)

                        delete session.userData.orden_compra
                        delete session.userData.orderNumber
                        delete session.userData.telefono
                        session.endConversation(botReply.cambioBoletaFactura_ocurrio_inconveniente)
                    }
                } else {
                    delete session.userData.orden_compra
                    delete session.userData.orderNumber
                    delete session.userData.telefono
                    session.endConversation(botReply.cambioBoletaFactura_ocurrio_inconveniente)
                }
            } else {
                delete session.userData.orden_compra
                delete session.userData.orderNumber
                delete session.userData.telefono
                session.send(botReply.cambioBoletaFactura_gracias_preferir_falabella)
                session.endConversation()
            }
        } else {
            session.endConversation()
        }
    }
])