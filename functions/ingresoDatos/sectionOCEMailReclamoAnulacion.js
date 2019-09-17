// *****************************************************************
// *                        Solo para webtracking                  *
// *****************************************************************
require('./sectionEndConversation')
require('./sectionEmail')
require('./sectionOCValidadorPalabras')
require('./sectionMetodoPago')
require('./sectionCardInfoAnulacion')
    // require('./sectionArgs')
    // require('./sectionCheckbox')
require('./sectionCheckboxList')
require('./sectionProductsList')
require('./sectionList')
require('./../saludos')
    // const intentLuis = require('../../functions/salidaDinamica')
const validarFechaSessionActiva = require('./../../functions/validaciones/fecha').validarFechaSessionActiva
const { validacionRutMailPorOC } = require('./../../functions/validaciones/validaRutMailEnOC')
const { MensajeDeAyuda, MensajeBuscandoInfo } = require('../../utils')
const { obtenerTipoDespacho } = require('../filtros/filtros')
    // const botReply = require('./text')

bot.dialog('/sectionOCEMailReclamoAnulacion', [
    (session, args, next) => {
        // session.userData.order.order.anulacion_subOrden = {}
        if (!validarFechaSessionActiva(session.userData)) {
            // session.send(botReply.text1)
            if (!session.userData.dataProgram.rutNoValidoEnOrdenCompra) {
                session.userData.dialogRetry = 1
                session.beginDialog('/sectionEmail')
                return
            }
            next()
        } else {
            session.userData.email = session.userData.dataPersonal.emailUsuario
            next()
        }
    },
    (session, results, next) => {
        if (!session.userData.dataProgram.rutNoValidoEnOrdenCompra || typeof session.userData.orden_compra === 'undefined' || typeof session.userData.orderNumber === 'undefined') {
            session.userData.email = (typeof results.response === 'undefined') ? session.userData.dataPersonal.emailUsuario : results.response
                // session.beginDialog('/sectionOC')
            session.userData.dialogRetryOC = 1
            session.beginDialog('/sectionOCValidadorPalabras')
            return
        }
        next()
    },
    async(session, results, next) => {
        const datosCliente = await validacionRutMailPorOC(session.userData, true)
        if (!datosCliente.datosOK) {
            session.beginDialog('/end_conversation', { mensaje: datosCliente.mensaje })
            // session.send(datosCliente.mensaje)
            // MensajeDeAyuda(session)
            // session.endConversation()
        } else {
            session.userData.dataProgram.rutNoValidoEnOrdenCompra = false
            if (results.response) {
                session.userData.orderNumber = results.response
            }
            next()
        }
        //
    },
    async(session, results, next) => {
        session.userData.dialogRetry = 1
            // session.send(`Estoy consultando los datos ingresados de la compra.`) Se reemplaza por MensajeBuscandoInfo - Historia SAC-1365
        MensajeBuscandoInfo(session)
        const getOrder = await WEBTRACKING.getOrder(session)
        const getPaymentMethods = await WEBTRACKING.getPaymentMethod(session)

        if (getOrder.success && getPaymentMethods.success && getPaymentMethods.state.type) {
            switch (getPaymentMethods.state.type) {
                case 'debitPayment':
                    session.userData.mediopago = 'Tarjeta Débito'
                    break
                case 'cashPayment':
                    session.userData.mediopago = 'Efectivo'
                    break
                case 'creditOrCmrPayment':
                    if (getPaymentMethods.state.payment_mode === 'CMRCard') {
                        session.userData.mediopago = 'Tarjeta CMR'
                    } else {
                        session.userData.mediopago = 'Tarjeta Crédito'
                    }
                    break
            }

            session.userData.fechaCompra = getOrder.state.created_date
            session.userData.idTicket = getOrder.state.ticket_id
            session.userData.ticketSequence = getOrder.state.ticket_sequence
            session.userData.ticketTerminal = getOrder.state.ticket_terminal

            const subOrden = getOrder.state.sub_orders
            session.userData.subOrders = getOrder.state.sub_orders

            if (subOrden.length > 0) {
                let subOrdenesProductos = []
                subOrden.forEach(function(e) {
                    let productsArray = []
                    e.products.forEach(function(ee) {
                        productsArray.push({
                            'value': `${ee.description}`,
                            'image': `${ee.image_url}`
                        })
                    })
                    subOrdenesProductos.push({
                        'fecha': e.delivery_status.initial_date,
                        'value': e.id,
                        'products': productsArray
                    })
                })
                session.userData.subOrdenesProductos = subOrdenesProductos
                console.info(JSON.stringify(getOrder.state))
                session.userData.order = {
                    'order': getOrder.state,
                    'itemsSelected': null
                }
                session.userData.order.order.anulacion_subOrden = {}
                session.beginDialog('/sectionCheckboxList')
            }
        } else {
            msg = 'Hubo un error al consultar la información de tu orden. Intenta más tarde.'
            session.beginDialog('/end_conversation', { mensaje: msg })
            // session.send()
            // session.endConversation()
        }
    },
    async(session, results, next) => {
        if (results.length > 0) {
            session.userData.checkBoxOrdersSelected = results
            const subOrden = session.userData.subOrders
            if (subOrden.length > 0) {
                let subOrdenesProductos = []
                session.userData.checkBoxOrdersSelected.forEach(function(orderSelected) {
                    let order = subOrden.find(_ => {
                        return _.id === orderSelected
                    })
                    let productsArray = []
                    order.products.forEach(function(ee) {
                        productsArray.push({
                            'value': `${ee.description}`,
                            'image': `${ee.image_url}`
                        })
                    })
                    subOrdenesProductos.push({
                        'value': `Despacho: ${orderSelected}`,
                        'products': productsArray
                    })
                })
                session.userData.subOrdenesProductos = subOrdenesProductos
                session.beginDialog('/sectionProductsList')
            }
        } else {
            session.endConversation('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
            session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
        }
    },
    async(session, results, next) => {
        if (!results.resumed) {
            if (results.response === 'SI') {
                MensajeBuscandoInfo(session)
                next()
            } else {
                session.endConversation('$no_confirmo_anulacion$ Entiendo. Recuerda que estoy aquí para ayudarte en lo que necesites.')
                session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
            }
        } else {
            session.endConversation('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
            session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
        }
    },
    // se comenta a petición de negocio que no se validan estado para anulación 
    // async (session, results, next) => {
    //   const subOrden = session.userData.order.order.sub_orders
    //   const subOrden_selected = session.userData.checkBoxOrdersSelected

    // const ordenesSeleccionadas = []
    // var OS_array = subOrden.filter((SO) => { return subOrden_selected.includes(SO.id) })
    // const clienteObtenerLineas= await SIEBEL.clienteSubOrdenObtenerLineas(session.userData.orden_compra)
    // session.userData.order.order.anulacion_subOrden = obtenerTipoDespacho(OS_array)

    //

    // Object.values(session.userData.order.order.anulacion_subOrden.SO_Home_delivery).forEach(so => {
    //   ordenesSeleccionadas.push(so.id)
    // });
    // session.userData.checkBoxOrdersSelected = ordenesSeleccionadas
    // //
    //*********************************************************/ */
    // session.userData.checkBoxOrdersSelected = quitarOrderSelected(session.userData.order.order.anulacion_subOrden) // Quito las ordenes seleccionadas con is_delivered=false
    // next()
    // },
    async(session, results, next) => {

        const menuOptions = ['Arrepentimiento', 'Defecto estético', 'No Funciona', 'Modelo No Elegido', 'Producto Incompleto']
        const menuText = '$seleccion_por_que_anula$ Seleccione el motivo de la anulación' // botReply.text12
        builder.Prompts.choice(session, menuText, menuOptions, {
                listStyle: builder.ListStyle.button,
                maxRetries: 2
            })
            // session.beginDialog('/sectionCardInfoAnulacion')
            // if (session.userData.order.order.anulacion_subOrden.SO_Home_delivery.length === 0) {
            //   MensajeDeAyuda(session)
            //   session.endConversation()
            // } else {
            //   const menuOptions = ['Arrepentimiento', 'Defecto estético', 'No Funciona', 'Modelo No Elegido', 'Producto Incompleto']
            //   const menuText = 'Seleccione el motivo de la anulación' // botReply.text12
            //   builder.Prompts.choice(session, menuText, menuOptions, {
            //     listStyle: builder.ListStyle.button,
            //     maxRetries: 2
            //   })
            // }
    },
    async(session, results, next) => {
        if (!results.resumed) {
            switch (results.response.entity) {
                case 'Arrepentimiento':
                    session.userData.motivo = 'Arrepentimiento'
                    break
                case 'Defecto estético':
                    session.userData.motivo = 'Daño estético'
                    break
                case 'No Funciona':
                    session.userData.motivo = 'Daño técnico'
                    break
                case 'Modelo No Elegido':
                    session.userData.motivo = 'Modelo no elegido'
                    break
                case 'Producto Incompleto':
                    session.userData.motivo = 'Producto Incompleto'
                    break
            }
            next()
        } else {
            session.endConversation('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
            session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
        }
    },
    async(session, results, next) => {
        if (session.userData.checkBoxOrdersSelected == null) {
            let msg = 'Hubo un error al consultar la información de tu orden. Intenta más tarde.'
            session.beginDialog('/end_conversation', { mensaje: msg })
            // session.send('Hubo un error al consultar la información de tu orden. Intenta más tarde.')
            // session.endConversation()
        }

        if (session.userData.checkBoxOrdersSelected.length === session.userData.order.order.sub_orders.length) {
            // Anulación Compra Total
            switch (session.userData.motivo) {
                case 'Arrepentimiento':
                    session.userData.nivel1 = 'Boletas y Cobros'
                    session.userData.nivel2 = 'Anulación de compra total'
                    session.userData.nivel3 = 'Anulación de compra total'
                    break;
                case 'Daño estético':
                    session.userData.nivel1 = 'Gestión sobre el producto'
                    session.userData.nivel2 = 'Producto con daño estético'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PD'
                    break;
                case 'Daño técnico':
                    session.userData.nivel1 = 'Gestión sobre el producto'
                    session.userData.nivel2 = 'Producto con falla de functo'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PF'
                    break;
                case 'Modelo no elegido':
                    session.userData.nivel1 = 'Despachos'
                    session.userData.nivel2 = 'Prod entregado no corresponde'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PNC'
                    break;
                case 'Producto Incompleto':
                    session.userData.nivel1 = 'Gestión sobre el producto'
                    session.userData.nivel2 = 'Producto incompleto'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PI'
                    break;
            }
        } else {
            // Anulación Compra Parcial
            switch (session.userData.motivo) {
                case 'Arrepentimiento':
                    session.userData.nivel1 = 'Boletas y Cobros'
                    session.userData.nivel2 = 'Anulación de compra total'
                    session.userData.nivel3 = 'Anulación de compra total'
                    break;
                case 'Daño estético':
                    session.userData.nivel1 = 'Gestión sobre el producto'
                    session.userData.nivel2 = 'Producto con daño estético'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PD'
                    break;
                case 'Daño técnico':
                    session.userData.nivel1 = 'Gestión sobre el producto'
                    session.userData.nivel2 = 'Producto con falla de functo'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PF'
                    break;
                case 'Modelo no elegido':
                    session.userData.nivel1 = 'Despachos'
                    session.userData.nivel2 = 'Prod entregado no corresponde'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PNC'
                    break;
                case 'Producto Incompleto':
                    session.userData.nivel1 = 'Gestión sobre el producto'
                    session.userData.nivel2 = 'Producto incompleto'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PI'
                    break;
            }
        }
        session.beginDialog('/sectionArgs')
    }
])