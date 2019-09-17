require('./../../functions/ingresoDatos/sectionEndConversation')
require("./../../functions/saludos")
require("./../../functions/login/sectionLogin")
require("./../../functions/ingresoDatos/sectionList")
require("./../../functions/ingresoDatos/sectionEmail")
require("./../../functions/ingresoDatos/sectionRun")
require("./../../functions/ingresoDatos/sectionPhone")
require("./../../functions/ingresoDatos/sectionOCValidadorPalabras")
require("./solucion_quiebre_producto")
require("./solucion_total_entrega_falso")
require("./solucion_callback")
const { limpiaSession, transaccionesQuiebres, MensajeDeAyuda } = require("../../utils")
const { CODIGO, SERVICE } = require('../../utils/control_errores')

const botReply = require("./text")
const moment = require("moment")
const validarFechaSessionActiva = require("./../../functions/validaciones/fecha").validarFechaSessionActiva

function validaOC(orden_compra) {
    if (isNaN(orden_compra) === false && orden_compra.length === 10) {
        return true
    } else {
        return false
    }
}
async function obtenerMetodoPago(session) {
    let getPaymentMethods = await WEBTRACKING.getPaymentMethod(session)
    let mediopago = ""
    if (getPaymentMethods.success && getPaymentMethods.state.type) {
        if (getPaymentMethods.state.type == "debitPayment") {
            mediopago = "Tarjeta Débito"
        } else if (getPaymentMethods.state.type == "cashPayment") {
            mediopago = "Efectivo"
        } else if (getPaymentMethods.state.type == "creditOrCmrPayment") {
            if (getPaymentMethods.state.payment_mode == "CMRCard") {
                mediopago = "Tarjeta CMR"
            } else {
                mediopago = "Tarjeta Crédito"
            }
        }
        return mediopago
    } else {
        session.endConversation('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
    }
}
async function callbackIncumplimiento(session, ss) {
    const infoCliente = {
        rut: session.userData.rut,
        phone: session.userData.telefono,
        nombreCtc: "",
        apellidoCtc: "",
        mailCh: "",
        ss: ss
    }

    let responseCallbackService = await GENESYS.getClienteLlamadaSolicitar(infoCliente, "FALABELLA_SAC_BO_CH")

    if (responseCallbackService.response.Body.clienteLlamadaSolicitarExpResp.respMensaje.codigoMensaje == 1) {

        transaccionesQuiebres(session, {
            name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_BK_FINAL,
            request: { infoCliente, FALABELLA_SAC_BO_CH },
            response: responseCallbackService
        }, CODIGO.SUCCES)

    } else {

        transaccionesQuiebres(session, {
            name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_BK_FINAL,
            request: { infoCliente, FALABELLA_SAC_BO_CH },
            response: responseCallbackService
        }, CODIGO.ERROR_SERVICIO)
        logger.error(`/callback_bk_final`)

    }


    console.log(responseCallbackService)
    if (!responseCallbackService) {
        console.log(responseCallbackService)
    }
}
async function createSSIncumplimientoFecha(session) {
    session.userData.nivel1 = "Despachos"
    session.userData.nivel2 = "Incumplimiento de fecha"
    session.userData.nivel3 = "Incumplimiento fecha Entrega"
    session.userData.orderNumber = session.userData.orden_compra
    session.userData.mediopago = await obtenerMetodoPago(session)
    session.userData.motivo_reclamo = "Solicitud de reclamo incumplimiento"
    session.userData.motivo = ""
    let subOrdersArray = new Array()
    for (let subOrder of session.userData.arraySubOrdenesConIncumplimientoFecha) {
        subOrdersArray.push(subOrder.id)
    }
    session.userData.resultCreateSS = ""
    let resultCreateSSporIncumplimiento = await CONTROLLER.subOrdenCreateSS(subOrdersArray, session.userData.currentClientInfo, session)
        //session.userData.resultCreateSS = resultCreateSSporIncumplimiento
    console.log("### session.userData.resultCreateSSporIncumplimiento ###")
    console.log(session.userData.resultCreateSS)
    console.log("### session.userData.resultCreateSSporIncumplimiento ###")
    return resultCreateSSporIncumplimiento
}
async function crearArregloSubordenesProductos(arraySubOrdenes, session) {
    let subOrdenesProductos = new Array()
    let num_subordenes = arraySubOrdenes.length
    let contador_subordenes = 1
    let productsArrayString = ``
    session.userData.subOrdersRescheduledArray = new Array()
    arraySubOrdenes.forEach(function(e) {
        let hr = ""
        let status = ""
        let template_products = ""
        let template = ""
        let show_step_bar = false
        let contador_productos_total = 1
            //Validación de que no exista una suborden con quiebre (is_broken !== null)
        e.micro_steps.forEach(function(_status) {
            status = _status
        })
        let validacion_fecha_reprogramada = e.delivery_status.is_rescheduled
        let fecha_reprogramada = e.delivery_status.rescheduled_date
        let fecha_entrega = e.delivery_status.date
        let array_fecha_entrega = fecha_entrega.split("/")
        fecha_entrega = array_fecha_entrega[2] + "/" + array_fecha_entrega[1] + "/" + array_fecha_entrega[0]

        if (typeof status != "undefined") {
            if (status.status == "Tu orden está en camino al destino final") {
                if (e.delivery_status.is_delivered == false && e.delivery_status.is_broken == false && e.delivery_status.is_rescheduled == false && e.delivery_status.is_canceled == false && e.delivery_status.is_delayed == false) {
                    if (e.delivery_status.option == "address") {
                        status = `Tu orden se encuentra en ruta. La fecha pactada de tu despacho es <strong>${fecha_entrega}</strong>.`
                    }
                } else {
                    if (typeof status.alert == "undefined") {
                        status = status.status
                        show_step_bar = true
                    } else {
                        status = status.alert.message
                    }
                }
            } else if (status.status == "Tu orden está lista para ser retirada") {
                if (e.delivery_status.is_delivered == false && e.delivery_status.is_broken == false && e.delivery_status.is_rescheduled == false && e.delivery_status.is_canceled == false) {
                    if (e.delivery_status.option == "store") {
                        status = `Tu orden <strong>ya está lista para ser retirada</strong>. Recuerda que has solicitado el retiro de tu producto en <strong style="color: #8aac02;">${e.store.name}</strong> para el <strong>${fecha_entrega}</strong>. No olvides presentar carnet de identidad y número de orden al momento del retiro. <br />Recuerda que desde que recibes el e-mail de retiro, tienes 3 días para ir a buscar tu compra. Lo puedes hacer a cualquier hora mientras la tienda esté abierta. Posterior a este plazo, tu orden quedará anulada, por lo que deberás realizar nuevamente tu compra`
                        status += `<p class="ver_detalle_orden_compra" onclick="accionDetalleOrdenCompra(this);" style="cursor: pointer; text-align: center; color: #aad500; font-weight: bold; margin-top: 10px;">Detalle <span>[+]</span></p>`
                        status += `<div style="display: none;">El horario de atención es de <strong>${e.delivery_status.time} hrs.</strong>`
                        if (typeof e.store.map != "undefined" && e.store.map != "" && e.store.map != null) {
                            status += `<br /><br/>Mapa zona de retiro: <img class="mapa_zona_retiro" src="${e.store.map}" width="150" alt="Haz clíc para ampliar la imagen" title="Haz clíc para ampliar la imagen">`
                        }
                        status += `</div>`
                    }
                } else {
                    if (typeof status.alert == "undefined") {
                        status = status.status
                        show_step_bar = true
                    } else {
                        status = status.alert.message
                    }
                }
            } else if (status.status == "Tu orden fue entregada") {
                if (e.delivery_status.is_delivered == true) {
                    status = `Tu orden fue entregada el <strong>${fecha_entrega}</strong>.`
                    show_step_bar = true
                } else {
                    if (typeof status.alert == "undefined") {
                        status = status.status
                        show_step_bar = true
                    }
                }
            } else if (validacion_fecha_reprogramada === true && fecha_reprogramada !== null) {
                if (fecha_reprogramada >= moment().format("YYYY/MM/DD")) {
                    let aux_array = {
                        id_suborden: e.id,
                        fecha_reprogramada: fecha_reprogramada
                    }
                    session.userData.subOrdersRescheduledArray.push(aux_array)
                    status = `Lo sentimos, se produjo un inconveniente con tu orden de compra, por lo que tu despacho/retiro fue reprogramado para el día <strong>${moment(fecha_reprogramada).format("DD/MM/YYYY")}</strong>.`
                } else {
                    if (typeof status.alert == "undefined") {
                        status = status.status
                        show_step_bar = true
                    } else {
                        status = status.alert.message
                    }
                }
            } else if (typeof session.userData.resultCreateSSporIncumplimiento !== "undefined") {
                if (session.userData.resultCreateSSporIncumplimiento.success.filter(obj => obj.subOrden == e.id).length > 0) {
                    let resultSS = session.userData.resultCreateSSporIncumplimiento.success.filter(obj => obj.subOrden == e.id)
                    status = `Sabemos que tienes un inconveniente con tu despacho, es por eso que hemos creado una solicitud con el número <strong>${resultSS[0].msg}</strong>. Tu caso es muy importante para nosotros, es por eso que ya nos encontramos gestionando una solución.`
                }
            } else {
                if (typeof status.alert == "undefined") {
                    status = status.status
                    show_step_bar = true
                } else if (status.alert.message == "Necesitamos comunicarnos contigo por un inconveniente con tu despacho. Por favor, contáctate con nosotros a través de nuestra asistente virtual, presionando el botón de ayuda y entrando a la seccion seguimiento de orden, y te entregaremos una solución a la brevedad.") {
                    status = "Lamentablemente hemos tenido un inconveniente con tu producto, debido a esto no podrá ser entregado"
                } else {
                    status = status.alert.message
                }
            }
        }

        let productsArray
        let num_total_productos = e.products.length
        let contador_productos = 1

        e.products.forEach(function(ee) {
            if (contador_productos == 1) {
                if (num_total_productos >= 4 && contador_productos_total == 1) {
                    productsArrayString += `{
            "type": "Container",
            "items": [`
                }
                productsArrayString += `{
          "type": "ColumnSet",
          "columns": [
        `
            }

            let product_description = ee.description
            product_description = product_description.replace(/"/g, "&#34;")

            productsArrayString += `{
        "type": "Column",
        "width": "auto",
        "separator": false,
        "items": [
            {
              "type": "Image",
              "url": "${ee.image_url}",
              "horizontalAlignment": "center",
              "size": "medium"
            },
            {
              "type": "TextBlock",
              "text": "${product_description}",
              "horizontalAlignment": "center",
              "wrap": true,
              "size": "small"
            }
        ]`

            if (contador_productos < 3) {
                if (contador_productos_total != num_total_productos) {
                    productsArrayString += `
            },
          `
                } else {
                    productsArrayString += `
            }
          `
                    if (contador_subordenes <= num_subordenes) {
                        productsArrayString += `]
              }
            `
                    }
                }
            } else {
                productsArrayString += `}
          ]
        `
                if (contador_productos_total < num_total_productos) {
                    productsArrayString += `},`
                } else {
                    productsArrayString += `}`
                }
            }

            contador_productos++
            contador_productos_total++
            if (contador_productos > 3) {
                contador_productos = 1
            }
            if (contador_productos_total > num_total_productos && num_total_productos > 3) {
                productsArrayString += `]}`
            }
        })

        productsArray = JSON.parse(productsArrayString)

        if (subOrdenesProductos.length > 0) hr = "<hr>"

        template_products = `
      ${hr}
      <div class="section-list-info-compra">
        <p><strong>Productos:</strong></p>
      </div>
    `

        if (!show_step_bar) {
            template = `
        <div class="section-list-info-compra">
          <p><strong>Despacho:</strong> ${e.id}</p>
          <p><strong>Estado:</strong> ${status}</p>
        </div>
      `
        } else {
            template = `<div class="section-list-info-compra">
                    <p><strong>Despacho:</strong> ${e.id}</p>
                    <p><strong>Estado:</strong></p>
                    <div class="fb-timeline__wrap">
                      <div class="fb-timeline__bar"></div>
                      <div class="fb-timeline__bar-progress"></div>`

            let num_macro_pasos = e.macro_steps.length
            let contador_macro_pasos = 1
            e.macro_steps.forEach(function(steps) {
                let fecha_step = steps.date
                let array_fecha_step = fecha_step.split("/")
                fecha_step = array_fecha_step[2] + "/" + array_fecha_step[1]
                if (steps.status.indexOf("cancelada") != -1) {
                    template += `<div class="fb-timeline__step fb-timeline__step-${contador_macro_pasos} cancelado" data-status="activo">`
                } else {
                    if (contador_macro_pasos == 1) {
                        template += `<div class="fb-timeline__step fb-timeline__step-${contador_macro_pasos} fb-timeline__active" data-status="activo">`
                    } else {
                        template += `<div class="fb-timeline__step fb-timeline__step-${contador_macro_pasos}" data-status="activo">`
                    }
                }
                template += `<div class="fb-timeline__step__circle fb-timeline__step__circle-${contador_macro_pasos}"></div>
                    <div class="fb-timeline__step__text fb-timeline__step__text-${contador_macro_pasos}">
                      <span>${steps.status}</span>
                      <span>${fecha_step}</span>
                    </div>
                  </div>`
                contador_macro_pasos++
            })
            let array_macro_steps = new Array()
            if (num_macro_pasos > 0 && num_macro_pasos < 4) {
                array_macro_steps[2] = "Orden confirmada"
                if (e.delivery_status.option == "address") {
                    array_macro_steps[3] = "Orden en camino"
                } else if (e.delivery_status.option == "store") {
                    array_macro_steps[3] = "Orden lista para retiro"
                }
                array_macro_steps[4] = "Orden entregada"
                for (let i = ++num_macro_pasos; i <= 4; i++) {
                    template += `<div class="fb-timeline__step fb-timeline__step-${i}">
                        <div class="fb-timeline__step__circle fb-timeline__step__circle-${i}"></div>
                        <div class="fb-timeline__step__text fb-timeline__step__text-${i}">
                          <span>${array_macro_steps[i]}</span>
                        </div>
                      </div>`
                }
            } else if (num_macro_pasos == 0) {
                array_macro_steps[1] = "Orden recibida"
                array_macro_steps[2] = "Orden cancelada"
                if (e.delivery_status.option == "address") {
                    array_macro_steps[3] = "Orden en camino"
                } else if (e.delivery_status.option == "store") {
                    array_macro_steps[3] = "Orden lista para retiro"
                }
                array_macro_steps[4] = "Orden entregada"
                for (let i = ++num_macro_pasos; i <= 4; i++) {
                    if (i == 1) {
                        template += `<div class="fb-timeline__step fb-timeline__step-${i} fb-timeline__active" data-status="activo">
                        <div class="fb-timeline__step__circle fb-timeline__step__circle-${i}"></div>
                        <div class="fb-timeline__step__text fb-timeline__step__text-${i}">
                          <span>${array_macro_steps[i]}</span>
                        </div>
                      </div>`
                    } else if (i == 2) {
                        template += `<div class="fb-timeline__step fb-timeline__step-${i} cancelado" data-status="activo">
                        <div class="fb-timeline__step__circle fb-timeline__step__circle-${i}"></div>
                        <div class="fb-timeline__step__text fb-timeline__step__text-${i}">
                          <span>${array_macro_steps[i]}</span>
                        </div>
                      </div>`
                    } else {
                        template += `<div class="fb-timeline__step fb-timeline__step-${i}">
                        <div class="fb-timeline__step__circle fb-timeline__step__circle-${i}"></div>
                        <div class="fb-timeline__step__text fb-timeline__step__text-${i}">
                          <span>${array_macro_steps[i]}</span>
                        </div>
                      </div>`
                    }
                }
            }
            template += `</div>
                </div>`
        }

        subOrdenesProductos.push({
            value_template: template,
            value_template_products: template_products,
            products: productsArray
        })
        productsArrayString = ``
        contador_subordenes++
    })

    return subOrdenesProductos
}
async function fcrReagendamiento(session, arrayListadoSolicitudes) {
    if (arrayListadoSolicitudes.length === 0) return false
    console.log("### fcrReagendamiento ###")
    let listadoSolicitudesFiltrado = arrayListadoSolicitudes.filter(
        s =>
        s.nivel3 == "Incumplimiento fecha Entrega" &&
        s.numeroOC == session.userData.orden_compra &&
        s.estado == "Abierto"
    )
    let arrayReagendamiento = []
    session.userData.subOrdersRescheduledArray.forEach(function(objSubOrden) {
        listadoSolicitudesFiltrado.forEach(function(solicitud) {
            if (solicitud.numeroSubOrden == objSubOrden.id_suborden && objSubOrden.ss == null) {
                arrayReagendamiento.push({
                    id_suborden: objSubOrden.id_suborden,
                    fecha_reprogramada: objSubOrden.fecha_reprogramada,
                    ss: solicitud.numeroSS
                })
            }
        })
    })
    for (const subOrdenObj of arrayReagendamiento) {
        session.userData.nivel1 = "Consultas Generales"
        session.userData.nivel2 = "Estado del reclamo"
        session.userData.nivel3 = "Estado del reclamo"
        session.userData.motivo_reclamo = `First Contact Resolution \n Fecha Reprogramada: ${subOrdenObj.fecha_reprogramada}`
        session.userData.motivo = ""
        session.userData.numeroSubOrdenFCR = subOrdenObj.id_suborden
        session.userData.numeroSSFCR = subOrdenObj.ss
        await CONTROLLER.createFCR(null, session.userData.currentClientInfo, session)
            //console.log(resultCreateFCR)
            //return resultCreateFCR
    }
}

function obtenerTelefonoContacto(arrayListadoTelefono) {
    /*
    if (typeof arrayListadoTelefono !== 'undefined' && arrayListadoTelefono.length > 0) {
      for (let telefono of arrayListadoTelefono) {
        if (telefono.@Primario == 'Y') {
          if (telefono.codigoArea !== null) {
            return telefono.codigoArea + telefono.numeroTelefono
          } else {
            return telefono.numeroTelefono
          }
          break
        }
      }
    }
    */
    return ""
}

function validarListadoSolicitudes(listadoSolicitudesOrdenCompra) {
    if (listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput != null && listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp != null) {
        if (listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.mensajeError == "OK" && listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener.length > 0) {
            return listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener
        } else {
            console.log("Error: fcrGenerica - validarListadoSolicitudes")
            return null
        }
    }
}

function validarCurrentClientInfo(currentClientInfo) {
    if (typeof currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse !== "undefined" && currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse !== null) {
        if (currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto.length > 0) {
            return currentClientInfo
        } else {
            console.log("Error: fcrGenerica - validarCurrentClientInfo")
            return null
        }
    }
}
async function fcrDeConsulta(session, listadoSolicitudesOrdenCompra, generica = true) {
    session.userData.nivel1 = "Consultas Generales"
    session.userData.nivel2 = "Estado de Orden de Compra"
    session.userData.nivel3 = "Estado de Orden de Compra"
    session.userData.motivo = ""
    const arrayListadoSolicitudesFcr = validarListadoSolicitudes(listadoSolicitudesOrdenCompra)
    const currentClientInfo = validarCurrentClientInfo(session.userData.currentClientInfo)
    let results = []
    if (arrayListadoSolicitudesFcr !== null && currentClientInfo !== null && generica === false) {
        for (const subOrdenObj of session.userData.arraySubOrdenesConRetiroPendiente) {
            const statusResult = subOrdenObj.macro_steps.find(ObjectStatus => ObjectStatus.status == "Orden lista para retiro");
            session.userData.motivo_reclamo = `First Contact Resolution \n Se le indica al cliente que la orden esta lista para retiro cliente ${statusResult.date} fecha lista para retiro cliente.`
            let resultFcr = await CONTROLLER.createFCR(null, currentClientInfo, session)
            results.push(resultFcr)
        }
    } else if (arrayListadoSolicitudesFcr !== null && currentClientInfo !== null && generica === true) {
        session.userData.motivo_reclamo = "First Contact Resolution"
        let resultFcr = await CONTROLLER.createFCR(arrayListadoSolicitudesFcr, currentClientInfo, session, false)
        results.push(resultFcr)
    } else {
        console.log("Error - fcr de Consulta")
    }
    return results
}
/**
 * ###### Login ######
 * Se agrega validación para el login,
 * si la session no esta activa para pedir datos de entrada 'Email y Rut. 
 * 
 * Si esta Logueado se valida si el email y el rut tienen datos.
 * ###### Login ######
 */
bot.dialog("/informacion_orden_compra", [
    // (session, args, next) => {
    //   session.userData.dataProgram.sessionActiva = false
    //   session.beginDialog('/sectionLogin')
    // },
    (session, args, next) => {
        limpiaSession(session)
        session.send(botReply.text21)
        session.userData.dialogRetryOC = 0
        session.beginDialog('/sectionOCValidadorPalabras')
    },
    async(session, results, next) => {
        if (!validarFechaSessionActiva(session.userData)) {
            //if (!session.userData.dataProgram.sessionActiva) {
            session.userData.orden_compra = results.response
            session.userData.dialogRetry = 1
            session.beginDialog("/sectionEmail")
        } else {
            session.userData.email = session.userData.dataPersonal.emailUsuario
            session.userData.rut = session.userData.dataPersonal.rutUsuario

            next()
        }
    },
    async(session, results, next) => {
        if (!validarFechaSessionActiva(session.userData)) {
            //if (!session.userData.dataProgram.sessionActiva) {
            session.userData.email = results.response
            session.beginDialog("/sectionRun")
        } else {
            next()
        }
    },
    async(session, results, next) => {
        session.beginDialog("/sectionPhone")
    },
    async(session, results, next) => {
        try {
            session.userData.orderNumber = session.userData.orden_compra
            let response = await WEBTRACKING.getOrder(session)
            if (!response) {
                //session.send("Hubo un error al consultar la información de tu orden. Por favor intenta más tarde.")
                // session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
                // session.endConversation()
                let msg = 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
                session.beginDialog('/end_conversation', { mensaje: msg })
                return
            } else {
                if (response.success == true) {
                    session.userData.subOrders = response.state.sub_orders
                    session.userData.state = response.state
                        /* Almacenamiento en sesión de datos necesarios para la creación de una SS de ser necesaria */
                    session.userData.order = {
                        order: response.state,
                        itemsSelected: null
                    }
                    session.userData.fechaCompra = response.state.created_date
                    session.userData.tienda = "Internet"
                    session.userData.idTicket = response.state.ticket_id
                    session.userData.ticketSequence = response.state.ticket_sequence
                    session.userData.ticketTerminal = response.state.ticket_terminal

                    let arraySubOrdenesSinQuiebre = new Array()
                    let arraySubOrdenesConQuiebre = new Array()
                    let flag_quiebre_subordenes = false
                    session.userData.subOrdenesProductos = ""
                    session.userData.numSubOrdenesProductos = response.state.sub_orders.length
                    let totalEntregaFalso = false
                    response.state.sub_orders.forEach(function(e) {
                            //Total entrega
                            if (e.delivery_status.is_delayed == false) {
                                if (e.delivery_status.option == "address") {
                                    e.macro_steps.forEach(function(m) {
                                        if (m.status == "Orden entregada") {
                                            if (totalEntregaFalso == false) {
                                                session.userData.flagTotalEntregaFalsoMensajeAyuda = true
                                                totalEntregaFalso = true
                                            }
                                        }
                                    })
                                }
                            }
                            //Validación de que no exista una suborden con quiebre (is_broken !== false)
                            //if (e.delivery_status.is_broken == false) {
                            if (e.delivery_status.is_broken !== false) {
                                //org
                                arraySubOrdenesConQuiebre.push(e)
                            } else {
                                arraySubOrdenesSinQuiebre.push(e)
                            }
                        })
                        //Incumplimiento de fecha
                    let arraySubOrdenesConIncumplimientoFecha = new Array()
                    let arraySubOrdenesConRetiroPendiente = new Array()
                        // let arraySubOrdenesSinIncumplimientoFecha = new Array()

                    arraySubOrdenesSinQuiebre.forEach(function(e) {
                        if (e.delivery_status.is_delayed == true) {
                            arraySubOrdenesConIncumplimientoFecha.push(e)
                            e.macro_steps.forEach(function(m) {
                                    if (m.status == "Orden lista para retiro") {
                                        arraySubOrdenesConRetiroPendiente.push(e)
                                    }
                                })
                                // if (e.delivery_status.option == "address") {
                                //   arraySubOrdenesConIncumplimientoFecha.push(e)
                                // } else if (e.delivery_status.option == "store") {
                                //   e.macro_steps.forEach(function (m) {
                                //     if (m.status == "Orden lista para retiro") {
                                //       arraySubOrdenesConIncumplimientoFecha.push(e)
                                //       // arraySubOrdenesSinIncumplimientoFecha.push(e)
                                //     }
                                //   })
                                // }
                        }
                    })

                    session.userData.currentClientInfo = await new Promise(
                        (resolve, reject) => {
                            resolve(SIEBEL.getClientInfo(session.userData.rut))
                        }
                    )

                    if (arraySubOrdenesConQuiebre.length > 0) {
                        flag_quiebre_subordenes = true
                            //session.userData.subOrdenesProductos = crearArregloSubordenesProductos(arraySubOrdenesConQuiebre, session)
                        session.userData.numSubOrdenesProductosConQuiebre = arraySubOrdenesConQuiebre.length
                        session.userData.subOrdersArray = arraySubOrdenesConQuiebre
                    } // else {
                    // session.userData.subOrdenesProductos = crearArregloSubordenesProductos(arraySubOrdenesSinQuiebre, session)
                    //}

                    const listadoSolicitudesOrdenCompra = await SIEBEL.solicitudListadoObtener(session.userData.rut, session.userData.orden_compra)
                    let flagDuplicidadSS
                    if (arraySubOrdenesConIncumplimientoFecha.length > 0) {
                        for (let subOrdenArray of arraySubOrdenesConIncumplimientoFecha) {
                            flagDuplicidadSS = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(session.userData.rut, session.userData.orden_compra, subOrdenArray.id, "Incumplimiento fecha Entrega")
                        }
                    } else {
                        flagDuplicidadSS = []
                    }
                    session.userData.callbackExist = false
                    session.userData.flagCreate = false

                    if (flagDuplicidadSS.length == 0 && arraySubOrdenesConIncumplimientoFecha.length > 0) {
                        let subOrdenesConIncumplimiento = []
                        const filtrarRetiroEnTiendas = function(array) {
                            //remueve un objeto del array si este esta Orden lista para retiro y (is_delayed === true)
                            let newArray = array.filter(function(subOrden) {
                                let macroStatusLength = subOrden.macro_steps.length - 1
                                return !(subOrden.delivery_status.is_delayed === true && subOrden.macro_steps[macroStatusLength].status == "Orden lista para retiro")
                            })
                            return newArray
                        }
                        subOrdenesConIncumplimiento = filtrarRetiroEnTiendas(arraySubOrdenesConIncumplimientoFecha)
                        if (subOrdenesConIncumplimiento.length > 0) {
                            session.userData.arraySubOrdenesConIncumplimientoFecha = subOrdenesConIncumplimiento
                                //session.userData.arraySubOrdenesConIncumplimientoFecha = arraySubOrdenesConIncumplimientoFecha
                            let resultCreateSSporIncumplimiento = await createSSIncumplimientoFecha(session)
                            session.userData.resultCreateSSporIncumplimiento = resultCreateSSporIncumplimiento
                            if (typeof resultCreateSSporIncumplimiento != "undefined" && typeof resultCreateSSporIncumplimiento != null) {
                                if (typeof resultCreateSSporIncumplimiento.success != "undefined" && resultCreateSSporIncumplimiento.success != null && resultCreateSSporIncumplimiento.success.length > 0) {
                                    session.userData.callbackSS = resultCreateSSporIncumplimiento.success[0].msg
                                    session.userData.telefonoCallback = session.userData.telefono
                                    session.userData.flagCreate = true
                                }
                            }
                        }
                    } else if (flagDuplicidadSS.length > 0 && arraySubOrdenesConIncumplimientoFecha.length > 0) {
                        session.userData.nivel1 = "Consultas Generales"
                        session.userData.nivel2 = "Estado del reclamo"
                        session.userData.nivel3 = "Estado del reclamo"
                        session.userData.motivo_reclamo = "First Contact Resolution"
                        session.userData.motivo = ""
                        session.userData.numeroSubOrdenFCR = flagDuplicidadSS[0].numeroSubOrden
                        session.userData.numeroSSFCR = flagDuplicidadSS[0].numeroSS
                        console.log("### FCR de Incumplimiento")
                        let createFCR = await CONTROLLER.createFCR(null, session.userData.currentClientInfo, session)
                        if (createFCR.success.length > 0) {
                            session.userData.flagCreate = true
                        } else {
                            //error
                            console.log(createFCR)
                        }
                    }
                    session.userData.subOrdenesProductos = await new Promise(
                        (resolve, reject) => {
                            resolve(
                                crearArregloSubordenesProductos(
                                    response.state.sub_orders,
                                    session
                                )
                            )
                        }
                    )
                    if (session.userData.subOrdenesProductos) {
                        session.beginDialog("/sectionList", {
                            flag_quiebre: flag_quiebre_subordenes
                        })
                    }
                    // Se deshabilita el callback para incumplimiento de fecha, solicitud de backoffice 03/10/2018
                    /*
                    if (typeof session.userData.callbackSS !== "undefined" && session.userData.callbackSS != null) {
                      let flagFlechaBloqueadaCallback = await GENESYS.validarBloqueoDiaCallback('FALABELLA_SAC_BO_CH')
                      if (!flagFlechaBloqueadaCallback) {
                        if (moment().hours() >= 9 && moment().hours() < 21) {
                          session.beginDialog('/solucion_callback')
                        }
                      }
                    }
                    */

                    if (listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput != null && typeof listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput !== 'undefined' && listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp != null) {
                        if (listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.mensajeError == "OK" && listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener.length > 0) {
                            let arrayListadoSolicitudes = listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener

                            if (session.dialogData.flag_quiebre) {
                                let flag_existe_solicitud = false
                                let numero_solicitud_existente = ""
                                for (let solicitud of arrayListadoSolicitudes) {
                                    if (solicitud.nivel3 == "Incumplimiento Sin Stock" && solicitud.estado == "Abierto") {
                                        session.userData.solicitudQuiebre = solicitud
                                        numero_solicitud_existente = solicitud.numeroSS
                                        flag_existe_solicitud = true
                                        break
                                    }
                                }

                                if (flag_existe_solicitud && numero_solicitud_existente != "") {
                                    const solicitudExistenteDetalleObtener = await SIEBEL.solicitudDetalleObtener(numero_solicitud_existente)
                                    let flag_no_contacto_cliente = false
                                    if (typeof solicitudExistenteDetalleObtener.SolicitudDetalleObtenerOutput !== 'undefined' && solicitudExistenteDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.ListaDeActividades != null) {
                                        // FCR QUIEBRE
                                        let flagDuplicidadSSQuiebre
                                        if (arraySubOrdenesConQuiebre.length > 0) {
                                            for (let subOrdenArray of arraySubOrdenesConQuiebre) {
                                                flagDuplicidadSSQuiebre = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(session.userData.rut, session.userData.orden_compra, subOrdenArray.id, "Incumplimiento Sin Stock")
                                            }
                                        } else {
                                            flagDuplicidadSSQuiebre = []
                                        }
                                        if (flagDuplicidadSSQuiebre.length > 0 && arraySubOrdenesConQuiebre.length > 0) {
                                            session.userData.nivel1 = "Consultas Generales"
                                            session.userData.nivel2 = "Estado del reclamo"
                                            session.userData.nivel3 = "Estado del reclamo"
                                            session.userData.motivo_reclamo = "First Contact Resolution"
                                            session.userData.motivo = ""
                                            session.userData.numeroSubOrdenFCR = flagDuplicidadSSQuiebre[0].numeroSubOrden
                                            session.userData.numeroSSFCR = flagDuplicidadSSQuiebre[0].numeroSS
                                            let quiebreFCR = await CONTROLLER.createFCR(null, session.userData.currentClientInfo, session)
                                            if (quiebreFCR.success.length > 0) {
                                                session.userData.flagCreate = true
                                            } else {
                                                //error
                                                console.log(quiebreFCR)
                                            }
                                        }
                                        // FCR QUIEBRE
                                        let actividades = solicitudExistenteDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.ListaDeActividades.Actividades
                                        for (let actividad of actividades) {
                                            //Tomar en cuenta que el servicio trae la información del detalle del contacto con el cliente en el atributo texto4
                                            if ((actividad.tipo == "BackOffice" && actividad.subTipo == "Contacto Inicial" && actividad.estado == "Cerrado" && actividad.texto4 == "Sin Contacto / No contesta") ||
                                                (actividad.tipo == "BackOffice" && actividad.subTipo == "Contacto Inicial" && actividad.estado == "Cerrado" && actividad.texto4 == "Sin Contacto / Sin fono") ||
                                                (actividad.tipo == "BackOffice" && actividad.subTipo == "Contacto Inicial" && actividad.estado == "Asignada" && actividad.texto4 == "") ||
                                                (actividad.tipo == "BackOffice" && actividad.subTipo == "Contacto Inicial" && actividad.estado == "En proceso" && actividad.texto4 == "") ||
                                                (actividad.tipo == "BackOffice" && actividad.subTipo == "Enviar Correo" && actividad.estado == "Asignada" && actividad.texto4 == "") ||
                                                (actividad.tipo == "BackOffice" && actividad.subTipo == "Enviar Correo" && actividad.estado == "En proceso" && actividad.texto4 == "") ||
                                                (actividad.tipo == "BackOffice" && actividad.subTipo == "Enviar Correo" && actividad.estado == "Cerrada" && actividad.texto4 == "") ||
                                                (actividad.tipo == "BackOffice" && actividad.subTipo == "Verificar SS" && actividad.estado == "Asignada") ||
                                                (actividad.tipo == "BackOffice" && actividad.subTipo == "Verificar SS" && actividad.estado == "En proceso")) {
                                                //if (actividad.tipo == 'BackOffice' && actividad.subTipo == 'Enviar Correo' && actividad.estado == 'En Proceso' && actividad.texto4 == 'Sin Contacto / No contesta')
                                                //Opciones de Anulación o de contacto con ejecutiva
                                                flag_no_contacto_cliente = true
                                                break
                                            }
                                        }
                                    } else {
                                        flag_no_contacto_cliente = true
                                    }

                                    if (!flag_no_contacto_cliente) {
                                        let msj = `Estimado cliente, ya tienes una solicitud ingresada por inconvenientes con tu compra, el número de seguimiento es: ${session.userData.numeroSSFCR}. Un ejecutivo se encuentra trabajando en tu caso para darte una pronta solución`
                                        session.beginDialog('/end_conversation', { mensaje: msj })
                                        // session.send()
                                        // MensajeDeAyuda(session)
                                        // session.endConversation()
                                    } else {
                                        session.beginDialog("/solucion_quiebre_producto")
                                    }
                                } else {
                                    /* Existe quiebre en una o varias subórdenes de la orden de compra pero no existe SS creada, se procede a crear una SS */
                                    session.userData.nivel1 = "Despachos"
                                    session.userData.nivel2 = "Incumplimiento de fecha"
                                    session.userData.nivel3 = "Incumplimiento Sin Stock"
                                        //session.userData.nivel3 = 'Incumplimiento fecha Entrega' CM
                                    session.userData.motivo_reclamo = "Solicitud de incumplimiento sin stock creada por Amanda"
                                    session.userData.motivo = "Arrepentimiento"
                                    session.userData.orderNumber = session.userData.orden_compra
                                    session.userData.mediopago = await obtenerMetodoPago(session)
                                    let subOrdersArray = new Array()
                                    for (let subOrder of session.userData.subOrdersArray) {
                                        subOrdersArray.push(subOrder.id)
                                    }
                                    let subOrdenCreateSS = await CONTROLLER.subOrdenCreateSS(subOrdersArray, session.userData.currentClientInfo, session)
                                    let botReplyMsg = botReply.messageQuiebre(session.userData.nivel3)
                                    let reclamoMsg = botReplyMsg.titulo
                                    subOrdenCreateSS.success.forEach(obj => {
                                        reclamoMsg += "<br> &bull; " + obj.msg
                                    })
                                    if (subOrdenCreateSS.error.length > 0) {
                                        reclamoMsg += "<br> No Pudimos registrar la solicitud para el Despacho:"
                                    }
                                    subOrdenCreateSS.error.forEach(obj => {
                                        reclamoMsg += "<br> &bull; " + obj.subOrden + "<br>" + obj.msg
                                    })
                                    if (subOrdenCreateSS.success.length > 0) {
                                        session.userData.flagCreate = true
                                        reclamoMsg += "<br> " + botReplyMsg.pie
                                        // MensajeDeAyuda(session)
                                    }
                                    session.beginDialog('/end_conversation', { mensaje: reclamoMsg })
                                    // session.send(reclamoMsg)
                                    // session.endConversation()
                                }
                            }
                        }
                    }

                    if (totalEntregaFalso == true) {
                        session.beginDialog("/solucion_total_entrega_falso")
                    }

                    if (arraySubOrdenesConRetiroPendiente.length > 0) {
                        session.userData.arraySubOrdenesConRetiroPendiente = arraySubOrdenesConRetiroPendiente
                            // FCR Lista para retiro
                        let fcrListaRetiro = await fcrDeConsulta(session, listadoSolicitudesOrdenCompra, false)
                        if (response.state.sub_orders.length == 1 && fcrListaRetiro.length > 0 && session.userData.flagCreate == false) {
                            session.userData.flagCreate = true
                        }
                    }

                    if (typeof session.userData.subOrdersRescheduledArray != "undefined" && session.userData.subOrdersRescheduledArray != null && session.userData.subOrdersRescheduledArray.length > 0) {
                        /* Creación de FCR de reagendamiento por sub ordenes*/
                        if (typeof listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput !== 'undefined' && listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp != null && typeof listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener !== 'undefined') {
                            let ListadoSolicitudesArray = listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener
                            await fcrReagendamiento(session, ListadoSolicitudesArray)
                        }
                    }
                    if (session.userData.flagCreate == false) {
                        let createFcrResul = await fcrDeConsulta(session, listadoSolicitudesOrdenCompra)
                            // MensajeDeAyuda(session)
                            /*
                            if (createFcrResul[0].success.length > 0) {
                              session.send(botReply.message("noMensaje")) 
                            }else {
                              session.send(botReply.message("error"))
                            }*/
                    }
                } else {
                    session.endConversation("Hemos tenido un error al realizar la consulta. Por favor revisa que el número de orden de compra sea correcto y/o que el email sea el mismo utilizado en tu compra.")
                    session.beginDialog("/informacion_orden_compra")
                    return
                }
            }
        } catch (e) {
            console.log(e)
            session.endConversation("Hemos tenido un error al realizar la consulta. Por favor revisa que el número de orden de compra sea correcto y/o que el email sea el mismo utilizado en tu compra.")
            return
        }
    }
])