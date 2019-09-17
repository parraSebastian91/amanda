// const validate_fecha = require('../functions/validaciones/fecha.js');
const reclamoGeneral = require('./reclamo_general')
const seguimientoOrden = require('./seguimiento_orden')
const problemasProductos = require('./problemas_productos')
const logger = require('./../utils/logger')

module.exports = {
  async getEstadoF12(oc, suborder) {
    const clienteSubOrdenes = await SIEBEL.clienteSubOrdenObtener(oc)
    const subOrdenConEstado = clienteSubOrdenes.numeroSubOrden ? clienteSubOrdenes : clienteSubOrdenes.find(e => e.numeroSubOrden === suborder)
    return subOrdenConEstado
  },
  async srPromise(session, contacto, subOrdenConEstadoF12, productSkuArray, subOrden, ss, flagSKU) {
    const info = SIEBEL.formatInfo(
      session.userData.rut,
      contacto, {
        telefono: session.userData.telefono,
        estadoF12: (typeof subOrdenConEstadoF12 === 'undefined') ? '' : subOrdenConEstadoF12.estado,
        nivel1: session.userData.nivel1,
        nivel2: session.userData.nivel2,
        nivel3: session.userData.nivel3,
        descripcion: session.userData.motivo_reclamo,
        medioPago: session.userData.mediopago || '',
        fechaCompra: session.userData.fechaCompra,
        tiendaOrigen: session.userData.tienda,
        idTicket: session.userData.idTicket,
        secuencia: session.userData.ticketSequence,
        terminal: session.userData.ticketTerminal,
        motivo: session.userData.motivo,
        ListOfSKUF12: productSkuArray
      },
      session.userData.order,
      subOrden,
      flagSKU
    )
    // console.log(info)
    logger.info(`srPromise - info: ${JSON.stringify(info)}`)
    if (ss) {
      const createSR = await new Promise(resolve => {
        resolve(SIEBEL.createFCR(info, ss))
      })
      return createSR;
    }
    const createSR = await new Promise(resolve => {
      resolve(SIEBEL.createSR(info))
    })
    return createSR
  },
  async subOrdenCreateSS(subOrdersArray, currentClientInfo, session) {
    const msgDialog = {
      success: [],
      error: []
    }
    // let index = 0;
    for (const i of subOrdersArray) {
      const index = subOrdersArray.indexOf(i)
      try {
        const contacto = currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto[0]
        if (contacto.existeFlag !== 'No Existe') {
          const sub_orders = SIEBEL.subOrders(
            session.userData.order.order.sub_orders,
            subOrdersArray[index]
          )
          const productSkuArray = SIEBEL.subOrdersProductos(
            sub_orders.products,
            session.userData
          )

          const subOrdenConEstadoF12 = await this.getEstadoF12(
            session.userData.orden_compra,
            subOrdersArray[index]
          )

          // enviaremos petición a SR
          const createSR = await this.srPromise(
            session,
            contacto,
            subOrdenConEstadoF12,
            productSkuArray,
            sub_orders
          )
          
          if (createSR.codigo !== 0) { // existe algun error ? 
            session.send("Estamos teniendo una leve demora en la creación de tu solicitud, por favor espera unos segundos");
            const flagSSCreada = await SIEBEL.calcularSolicitudListadoObtenerPorOC( //veo si existe ss creada
              session.userData.rut,
              session.userData.orden_compra,
              session.userData.nivel3
            )
            if (flagSSCreada.length != undefined && flagSSCreada.length !== 0) {
              createSR.codigo = 0
              createSR.srNumber = flagSSCreada[0].numeroSS
            } else {
              createSR.mensaje = `No pudimos registrar la solicitud de servicio para el despacho: ${flagSSCreada[0].numeroSubOrden}. Ha ocurrido un inconveniente al ingresar la solicitud de servicio. Intente más tarde por favor`
            }
          }

          if (createSR.codigo === 0) {
            msgDialog.success.push({
              subOrden: subOrdersArray[index],
              msg: createSR.srNumber
            })
          } else {
            msgDialog.error.push({
              subOrden: subOrdersArray[index],
              msg: createSR.mensaje
            })
          }
        } else {
          session.send("Estamos teniendo una leve demora en la creación de tu solicitud, por favor espera unos segundos");
          msgDialog.error.push({
            subOrden: subOrdersArray[index],
            msg: 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
          })
        }
      } catch (error) {
        session.send("Estamos teniendo una leve demora en la creación de tu solicitud, por favor espera unos segundos");
        msgDialog.error.push({
          subOrden: subOrdersArray[index],
          msg: 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
        })
      }
    }
    return msgDialog
  },
  async createFCR(solicitudListadoObtener, currentClientInfo, session, flagSKU = true) {
    const msgDialog = {
      success: [],
      error: []
    }

    /* const subOrder = await new Promise((resolve, reject) => {
      resolve(this.validarEstadoFCR(subOrdenNumArray, currentClientInfo, session))
    })
    if (subOrder === false) {
      msgDialog.error.push({
        subOrden: null,
        msg: 'error: El estado de la SS es cerrado'
      })
    }
    const validarFechaSubOrdenDespacho = await new Promise((resolve, reject) => {
      resolve(this.validarFechaSubOrdenDespacho(subOrder, session.userData.order.order))
    })
    if (validarFechaSubOrdenDespacho === false) {
      msgDialog.error.push({
        subOrden: subOrder,
        msg: 'error: La fecha de despacho es inferior al dia actual.'
      })
    } */

    let subOrder
    let ss = ''
    if (typeof session.userData.numeroSSFCR !== 'undefined' && session.userData.numeroSSFCR !== null && session.userData.numeroSSFCR !== '') {
      subOrder = session.userData.numeroSubOrdenFCR
      ss = session.userData.numeroSSFCR
    } else if (solicitudListadoObtener !== null && typeof solicitudListadoObtener !== 'undefined') {
      // subOrder = solicitudListadoObtener[0].numeroSubOrden
      subOrder = session.userData.order.order.sub_orders[0].id
    } else if (solicitudListadoObtener === null || typeof solicitudListadoObtener === 'undefined') {
      subOrder = session.userData.order.order.sub_orders[0].id
    }

    if (msgDialog.error.length === 0) {
      if (typeof currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse === 'undefined' || currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse === null) {
        // console.log('Error: currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse')
        logger.error('Error: currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse')
        msgDialog.error.push({
          subOrden: subOrder,
          msg: 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
        })
        return msgDialog
      }
      const contacto = currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto[0]
      const sub_orders = SIEBEL.subOrders(session.userData.order.order.sub_orders, subOrder)
      if (contacto.existeFlag !== 'No Existe' && typeof sub_orders !== 'undefined') {
        const productSkuArray = SIEBEL.subOrdersProductos(
          sub_orders.products,
          session.userData
        )

        const subOrdenConEstadoF12 = await this.getEstadoF12(
          session.userData.orden_compra,
          subOrder
        )

        // enviaremos petición a SR
        const createSR = await this.srPromise(
          session,
          contacto,
          subOrdenConEstadoF12,
          productSkuArray,
          sub_orders,
          ss,
          flagSKU
        )

        if (createSR.codigo === 0) {
          msgDialog.success.push({
            subOrden: subOrder,
            msg: createSR.srNumber
          })
        } else {
          msgDialog.error.push({
            subOrden: subOrder,
            msg: createSR.mensaje
          })
        }
      } else {
        msgDialog.error.push({
          subOrden: subOrder,
          msg: 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)'
        })
      }
    }

    return msgDialog
  },
  async ccPromise(msg, orderId, subOrders, tipificacion) {
    const createCancel = new Promise(resolve => {
      resolve(OMS.cancelRequest(msg, orderId, subOrders, tipificacion))
    })
    return createCancel
  },
  async cancelRequestSubOrders(ssArray, orderId, subOrders, tipificacion) {
    for (const i of ssArray) {
      const index = ssArray.indexOf(i)
      await this.ccPromise(
        ssArray[index].msg,
        orderId,
        subOrders,
        tipificacion
      )
    }
    return 'ok cancel request'
  },
  validarEstadoFCR(listadoSolicitudesOrdenCompraArray) {
    const solicitudListadoObtenerArray = listadoSolicitudesOrdenCompraArray.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener

    const subOrder = solicitudListadoObtenerArray.filter(
      e => e.estado === 'Abierto'
    ).numeroSubOrden

    return subOrder
  },
  async obtenerMetodoPago(session) {
    const getPaymentMethods = await WEBTRACKING.getPaymentMethod(session)
    let mediopago = '';
    if (getPaymentMethods.success && getPaymentMethods.state.type) {
      if (getPaymentMethods.state.type === 'debitPayment') {
        mediopago = 'Tarjeta Débito';
      } else if (getPaymentMethods.state.type === 'cashPayment') {
        mediopago = 'Efectivo';
      } else if (getPaymentMethods.state.type === 'creditOrCmrPayment') {
        if (getPaymentMethods.state.payment_mode === 'CMRCard') {
          mediopago = 'Tarjeta CMR';
        } else {
          mediopago = 'Tarjeta Crédito';
        }
      }
      return mediopago
    }
    // session.endConversation('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes')
  },
  reclamoGeneral,
  seguimientoOrden,
  problemasProductos
  /*,
    async validarFechaSubOrdenDespacho(ordenNum, order) {
      var subOrder = false
      try {
        let subOrdenObj = order.sub_orders.find(function (element) {
          return element.id == ordenNum
        })
        subOrder = validate_fecha.validarFechaActual(subOrdenObj.delivery_status.date)
      } catch (error) {
        console.log(error)
        subOrder = false
      }
      return subOrder
    } */

}
