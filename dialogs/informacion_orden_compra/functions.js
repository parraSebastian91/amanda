const logger = require('./../../utils/logger')
const moment = require('moment')
const { Filtrar, transaccionesQuiebres } = require('../../utils')
const { CODIGO, SERVICE } = require('./../../utils/control_errores')

const TIPO_SOLICITUD = {
    INCUMPLIMIENTO_SIN_STOCK: 'incumplimiento_sin_stock',
    TOTAL_ENTREGA_FALSO: 'solucion_total_entrega_falso',
    LISTO_RETIRO_TIENDAS: 'listo_retiro_tiendas',
    INCUMPLIMIENTO_FECHA: 'incumplimiento_fecha',
    // REAGENDAMIENTO: 'reagendamiento',
    REAGENDAMIENTO_CON_INCUMPLIMIENTO: 'reagendamiento_con_incumplimiento',
    INC_SIN_STOCK_REAGENDADO: 'inc_sin_stock_reagendado',
    CONSULTAS_GENERALES: 'consultas_generales',
    INCUMPLIMIENTO_FECHA_FUERA_HORARIO: 'incumplimiento_fecha_fuera_horario'
}
const MACRO_STATUS = {
    ORDEN_RECIBIDA: 'Orden recibida',
    ORDEN_CONFIRMADA: 'Orden confirmada',
    ORDEN_EN_CAMINO: 'Orden en camino',
    ORDEN_LISTA_PARA_RETIRO: 'Orden lista para retiro',
    ORDEN_ENTREGADA: 'Orden entregada'
}
const TIPO_DESPACHO = ['address', 'store']

function getTipoSolicitud(prioridad, tipoSolicitud, subOrden) {
    let solObject = {
        sub_orden: null,
        prioridad: 0,
        dialogo: '',
        estado: null // Se usa para personalizar el estado y agregar descripción con SS
    }
    solObject.sub_orden = subOrden
    solObject.dialogo = tipoSolicitud
    solObject.prioridad = prioridad
    return solObject
}

function validarMacroStepsSolicitud(macroSteps, status) {
    return macroSteps.some((m) => {
        return m.status === status
    })
}

function valida_fecha(fentrega) {
    const date = new Date()
    const year = date.getFullYear()
    const mes = (date.getMonth() + 1 + "").padStart(2, '0')
    const dia = (date.getDate() + "").padStart(2, '0')
    const hactual = moment().hours()

    const fhoy = year + "/" + mes + "/" + dia

    if (fentrega === fhoy && hactual >= 21) {
        IFH = true
    } else {
        IFH = false
    }
    return IFH
}

// function objetoVacio(objeto) {
//     return (Object.keys(obj).length === 0)
// }
async function getArraySolicitud(sub_orders) {
    let sub_orders_procesadas = []
    sub_orders.forEach(function(subOrden) {
        let solicitud = false
        const DELIVERY_STATUS = subOrden.delivery_status
        const IS_BROKEN = subOrden.delivery_status.is_broken
        const DELIVERY_OPTION = subOrden.delivery_status.option.toLowerCase()
        const IS_DELAYED = subOrden.delivery_status.is_delayed
        const IS_RESCHEDULED = subOrden.delivery_status.is_rescheduled
        const RESCHEDULED_DATE = subOrden.delivery_status.rescheduled_date

        if (IS_BROKEN && TIPO_DESPACHO.includes(DELIVERY_OPTION) && validarMacroStepsSolicitud(subOrden.macro_steps, MACRO_STATUS.ORDEN_CONFIRMADA) && solicitud === false) {
            logger.info('# Quiebre incumplimiento_sin_stock # ')
            if (IS_RESCHEDULED === true) {
                logger.info('# Quiebre con reagendamiento # ')
                sub_orders_procesadas.push(getTipoSolicitud(7, TIPO_SOLICITUD.INC_SIN_STOCK_REAGENDADO, subOrden))
                solicitud = true
            } else if (IS_RESCHEDULED === false && solicitud === false) {
                logger.info('# Quiebre General # ')
                sub_orders_procesadas.push(getTipoSolicitud(1, TIPO_SOLICITUD.INCUMPLIMIENTO_SIN_STOCK, subOrden))
                solicitud = true
            }
        } else if (IS_DELAYED === false && DELIVERY_OPTION === TIPO_DESPACHO[0] && validarMacroStepsSolicitud(subOrden.macro_steps, MACRO_STATUS.ORDEN_ENTREGADA) && solicitud === false) {
            logger.info('# Total entrega #')
            sub_orders_procesadas.push(getTipoSolicitud(3, TIPO_SOLICITUD.TOTAL_ENTREGA_FALSO, subOrden))
            solicitud = true
        } else if (IS_DELAYED === true && solicitud === false) {
            if (IS_DELAYED === true && IS_RESCHEDULED === false && validarMacroStepsSolicitud(subOrden.macro_steps, MACRO_STATUS.ORDEN_LISTA_PARA_RETIRO)) {
                logger.info('# listo_retiro_tiendas #')
                sub_orders_procesadas.push(getTipoSolicitud(5, TIPO_SOLICITUD.LISTO_RETIRO_TIENDAS, subOrden))
                solicitud = true
            } else if (IS_DELAYED === true && IS_RESCHEDULED === true && RESCHEDULED_DATE != null && solicitud === false) {
                logger.info('# Incumplimiento de Reagendamiento #')
                sub_orders_procesadas.push(getTipoSolicitud(6, TIPO_SOLICITUD.REAGENDAMIENTO_CON_INCUMPLIMIENTO, subOrden))
                solicitud = true
            } else if (solicitud === false) {
                logger.info('# Incumplimiento de fecha #')
                sub_orders_procesadas.push(getTipoSolicitud(2, TIPO_SOLICITUD.INCUMPLIMIENTO_FECHA, subOrden))
                solicitud = true
            }
        }
        /* else if (IS_RESCHEDULED === true && IS_DELAYED === false && solicitud === false) {
            // Reagendamiento
            logger.info('# Reagendamiento #')
            const reagendamientoObj = reagendamiento(IS_RESCHEDULED, IS_DELAYED, subOrden)
            if (!objetoVacio(reagendamientoObj)) {
                sub_orders_procesadas.push(reagendamientoObj)
                solicitud = true
            }
        } */
        // Se usa el flag solicitud vara descartar el cruse de solicitudes



        if (solicitud === false) {

            if (valida_fecha(DELIVERY_STATUS.date) === true) {
                logger.info(' # incumplimiento fecha entrega, fuera horario # ')
                sub_orders_procesadas.push(getTipoSolicitud(8, TIPO_SOLICITUD.INCUMPLIMIENTO_FECHA_FUERA_HORARIO, subOrden))
                solicitud = true
            } else {
                logger.info(' # No cumple ninguna solicitud # ')
                sub_orders_procesadas.push(getTipoSolicitud(2, TIPO_SOLICITUD.CONSULTAS_GENERALES, subOrden))
                solicitud = true
            }

        }
    })
    logger.info(JSON.stringify(sub_orders_procesadas))
    return sub_orders_procesadas
}
const TIPOLOGIA = {
    /**
     * Procesa sub ordenes y establece el criterio de solicitud de servicio
     * @author: Front
     * @version: 1.0.0
     * @param:{data} Data necesaria para el request del servicio
     * @returns: Objeto con respuesta, status y un array de errores
     */
    async webtrackingProcess(session) {
        // console.log('webtrackingProcess')
        logger.info('function webtrackingProcess')
        let email = session.userData.email || ''
        let oc = session.userData.orderNumber || ''
        if (email === '' || oc === '') return false
        let response = await WEBTRACKING.getOrder(session)
        if (!response) {
            // 404
            logger.error(`webtrackingProcess: response = ${JSON.stringify(response)}`)
                // console.log(`Error:webtrackingProcess; response=${response}`)
            return false;
        } else if (response && response.success === true) {
            logger.debug(`webtrackingProcess: response.success = ${JSON.stringify(response)}`)
            let webTracking = {
                state: null,
                sub_orders_procesadas: []
            }
            webTracking.state = response.state
            const arraySolicitud = await getArraySolicitud(response.state.sub_orders)
            webTracking.sub_orders_procesadas = arraySolicitud
            logger.info(`webtrackingProcess: response = ${JSON.stringify(response)}`)
            return webTracking
        }
    },
    /**
     * Procesa las prioridades de las sub ordenes según y las ordena segun criterio.
     * @author: Front
     * @version: 1.0.0
     * @param:{array} Array de Sub Ordenes
     * @returns: retorna el array ordenado en el orden que se procesará
     */
    async ordenarSubOrdenesPorPrioridad(array) {
        logger.debug('function ordenarSubOrdenesPorPrioridad')
        try {
            if (array && array.length > 0) {
                let _array = array;
                _array.sort(function(a, b) {
                    return a.prioridad - b.prioridad;
                });
                return _array
            }
            return []
        } catch (error) {
            logger.error(`function:ordenarSubOrdenesPorPrioridad: ${JSON.stringify(error)}`)
                // console.log(`Error: ordenarSubOrdenesPorPrioridad - ${e}`)
            return []
        }
    },
    async removeElementArray(array) {
        logger.debug('function removeElementArray')
        return array.filter((i) => i !== array[0])
    },
    existeSolicitudPendiente(arraySolicitud, tipoSolicitud) {
        logger.debug('function existeSolicitudPendiente')
        return arraySolicitud.some((m) => {
            return m.dialogo === tipoSolicitud
        })
    },
    existenSolicitudesPorTipologia(arraySolicitud, tipoSolicitudes) {
        return arraySolicitud.some((solicitud) => tipoSolicitudes.includes(solicitud.dialogo))
    },
    // Pendiente eliminar funciones y crear solo una.
    // removerSolicitudesConIncumplimiento(array) {
    //     logger.debug('function removerSolicitudesConIncumplimiento')
    //     return array.filter((i) => i.dialogo !== TIPO_SOLICITUD.INCUMPLIMIENTO_FECHA)
    // },
    // removerSolicitudesGenerales(array) {
    //     logger.debug('function removerSolicitudesGenerales')
    //     return array.filter((i) => i.dialogo !== TIPO_SOLICITUD.CONSULTAS_GENERALES)
    // },
    // removerSolicitudesConReagendamiento(array) {
    //     logger.debug('function removerSolicitudesConReagendamiento')
    //     return array.filter((i) => i.dialogo !== TIPO_SOLICITUD.REAGENDAMIENTO)
    // },
    // removerSolicitudesIncReagendamiento(array) {
    //     logger.debug('function removerSolicitudesIncReagendamiento')
    //     return array.filter((i) => i.dialogo !== TIPO_SOLICITUD.REAGENDAMIENTO_CON_INCUMPLIMIENTO)
    // },
    removerSolicitudes(array, tipoSolicitudes) {
        logger.debug(`function removerSolicitudes tipoSolicitud= ${tipoSolicitudes}`)
        return array.filter((i) => !tipoSolicitudes.includes(i.dialogo))
    },
    removerSolicitudesListaRetiroEnTiendas(array) {
        logger.debug('function removerSolicitudesListaRetiroEnTiendas')
        return array.filter((i) => i.dialogo !== TIPO_SOLICITUD.LISTO_RETIRO_TIENDAS)
    },
    // filtrarSolicitudesConReagendamiento(array) {
    //     logger.debug('function filtrarSolicitudesConReagendamiento')
    //     return array.filter((i) => i.dialogo === TIPO_SOLICITUD.REAGENDAMIENTO)
    // },
    // filtrarSolConIncReagendamiento(array) {
    //     logger.debug('function filtrarSolConIncReagendamiento')
    //     return array.filter((i) => i.dialogo === TIPO_SOLICITUD.REAGENDAMIENTO_CON_INCUMPLIMIENTO)
    // },
    getCantidadSolQuiebre(array) {
        logger.debug('function getCantidadSolQuiebre')
        return array.filter((i) => i.dialogo === TIPO_SOLICITUD.INCUMPLIMIENTO_SIN_STOCK).length
    },
    tieneIncumplimientoFechaArray(arr) {
        return arr.filter((i) => i.dialogo === TIPO_SOLICITUD.INCUMPLIMIENTO_FECHA)
    },
    tieneIncumplimientoFechaFueraHorarioArray(arr) {
        return arr.filter((i) => i.dialogo === TIPO_SOLICITUD.INCUMPLIMIENTO_FECHA_FUERA_HORARIO)
    },
    tieneTotalEntregaFalsoArray(arr) {
        return arr.filter((i) => i.dialogo === TIPO_SOLICITUD.TOTAL_ENTREGA_FALSO)
    },
    filtrarSolicitudesArray(arr, tipoSolicitud) {
        logger.debug('function filtrarSolicitudesArray')
        try {
            return arr.filter((i) => i.dialogo === tipoSolicitud)
        } catch (error) {
            logger.error(`filtrarSolicitudesArray: ${JSON.stringify(error)}`)
            return []
        }
    },
    agregarEstadoSolPendiente(_solicitudesPendientes, ssResul) {
        const subOrdenCreadasArray = (array, subOrden) => {
            return array.success.filter((solicitudObj) => {
                return solicitudObj.subOrden === subOrden
            })
        }
        return _solicitudesPendientes.map(function(sol) {
            sol.estado = subOrdenCreadasArray(ssResul, sol.sub_orden.id)
            return sol
        })
    }
}

const SOLICITUD = {
    async createSSReagendamiento(session) {
        logger.info('function createSSReagendamiento')
        try {
            session.userData.nivel1 = 'Despachos'
            session.userData.nivel2 = 'Incumplimiento de fecha'
            session.userData.nivel3 = 'Incumplimiento fecha Entrega'
            session.userData.orderNumber = session.userData.orden_compra
            session.userData.mediopago = await CONTROLLER.obtenerMetodoPago(session)
            let fecha_reprogramada = moment(session.userData.fecha_reprogramada).format('DD/MM/YYYY')
            session.userData.motivo_reclamo = `SS de incumplimiento de fecha de entrega creado por Amanda. El Cliente tenía fecha pactada de reagendamiento para: ${fecha_reprogramada}.`
            session.userData.motivo = ''
            let subOrdersArray = []
                // for (let subOrder of session.userData.arraySubOrdenesConIncumplimientoFecha) {
            subOrdersArray.push(session.userData.subOrdenSolicitud.sub_orden.id)
                // }
            session.userData.resultCreateSS = ''
            let resultCreateSSporIncumplimiento = await CONTROLLER.subOrdenCreateSS(subOrdersArray, session.userData.currentClientInfo, session)
            logger.info(`result createSSReagendamiento: ${JSON.stringify(resultCreateSSporIncumplimiento)}`)
            return resultCreateSSporIncumplimiento
        } catch (error) {
            logger.error(`error createSSReagendamiento: ${JSON.stringify(error)}`)
            return null
        }
    },
    async createSsFcrReagendamiendo(session) {
        logger.info('createSsFcrReagendamiendo inicio')
        let response = {
            error: [],
            success: []
        }
        if (session.userData.subOrderIncReagendamientoArray.length > 0) {
            // let subOrdenSolicitud = session.userData.subOrderIncReagendamientoArray[0]
            for (const subOrdenSolicitud of session.userData.subOrderIncReagendamientoArray) {
                let flagDuplicidadSS
                flagDuplicidadSS = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(session.userData.rut, session.userData.orderNumber, subOrdenSolicitud.sub_orden.id, 'Incumplimiento fecha Entrega');
                if (!flagDuplicidadSS) {
                    flagDuplicidadSS = []
                }
                session.userData.flagCreate = false
                if (flagDuplicidadSS.length === 0) {
                    session.userData.subOrdenSolicitud = subOrdenSolicitud
                    session.userData.fecha_reprogramada = subOrdenSolicitud.sub_orden.delivery_status.rescheduled_date
                    let resultCreateSSporIncumplimiento = await this.createSSReagendamiento(session)
                    if (resultCreateSSporIncumplimiento) {
                        if (resultCreateSSporIncumplimiento.success.length > 0) {
                            logger.info('function: createSsFcrReagendamiendo - createSS')
                            resultCreateSSporIncumplimiento.success.forEach(function(result) {
                                const clone = Object.assign(result, { ss: result.msg })
                                response.success.push(clone)
                            })
                        }
                    } else if (resultCreateSSporIncumplimiento.error.length > 0) {
                        resultCreateSSporIncumplimiento.error.forEach(function(result) {
                            const clone = Object.assign(result, { ss: null })
                            response.success.push(clone)
                        })
                    }
                    logger.info(`createSsFcrReagendamiendo return: ${JSON.stringify(response)}`)
                } else if (flagDuplicidadSS.length > 0) {
                    const clone = {
                            subOrden: subOrdenSolicitud.sub_orden.id,
                            msg: '',
                            ss: flagDuplicidadSS[0].numeroSS
                        }
                        // const clone = Object.assign(SSR, { ss: flagDuplicidadSS[0].numeroSS })
                    response.success.push(clone)
                }
            }
        }
        return response
    },
    async fcrIncumplimientoSinStockReagendado(session) {
        logger.info('function fcrDeConsulta:')
            // let results = []
        let response = {
            error: [],
            success: []
        }
        try {
            let listadoSolicitudesOrdenCompra = session.userData.listadoSolicitudesOrdenCompra
            session.userData.nivel1 = 'Consultas Generales'
            session.userData.nivel2 = 'Estado de Orden de Compra'
            session.userData.nivel3 = 'Estado de Orden de Compra'
            session.userData.motivo = ''
            const arrayListadoSolicitudesFcr = this.validarListadoSolicitudes(listadoSolicitudesOrdenCompra)
            const currentClientInfo = this.validarCurrentClientInfo(session.userData.currentClientInfo)
            if (arrayListadoSolicitudesFcr !== null && currentClientInfo !== null) {
                for (const subOrdenObj of session.userData.subOrdersIncSinStockReagendado) {
                    let fecha_reprogramada = moment(subOrdenObj.fecha_reprogramada).format('DD/MM/YYYY')
                    session.userData.motivo_reclamo = `First Contact Resolution \n Quiebre con Reprogramación: ${fecha_reprogramada}`
                    let createFCR = await CONTROLLER.createFCR(null, currentClientInfo, session)
                    response.success.push(createFCR)
                }
            }
            logger.info(`fcrIncumplimientoSinStockReagendado: ${JSON.stringify(response)}`)
            return response
        } catch (error) {
            logger.error(`Error: fcrIncumplimientoSinStockReagendado: ${JSON.stringify(error)}`)
            return response
        }
    },
    async fcrDeConsulta(session, generica = true) {
        logger.info('function fcrDeConsulta:')
        let results = []
        try {
            let listadoSolicitudesOrdenCompra = session.userData.listadoSolicitudesOrdenCompra
            session.userData.nivel1 = 'Consultas Generales'
            session.userData.nivel2 = 'Estado de Orden de Compra'
            session.userData.nivel3 = 'Estado de Orden de Compra'
            session.userData.motivo = ''
            const arrayListadoSolicitudesFcr = this.validarListadoSolicitudes(listadoSolicitudesOrdenCompra)
            const currentClientInfo = this.validarCurrentClientInfo(session.userData.currentClientInfo)
            if (arrayListadoSolicitudesFcr !== null && currentClientInfo !== null && generica === false) {
                logger.info('fcrDeConsulta - lista para retiro')
                for (const subOrdenObj of session.userData.arraySubOrdenesConRetiroPendiente) {
                    const statusResult = subOrdenObj.macro_steps.find(ObjectStatus => ObjectStatus.status === 'Orden lista para retiro')
                    session.userData.motivo_reclamo = `First Contact Resolution \n Se le indica al cliente que la orden esta lista para retiro cliente ${statusResult.date} fecha lista para retiro cliente.`
                    let resultFcr = await CONTROLLER.createFCR(null, currentClientInfo, session)
                    results.push(resultFcr)
                }
            } else if (arrayListadoSolicitudesFcr !== null && currentClientInfo !== null && generica === true) {
                session.userData.motivo_reclamo = 'First Contact Resolution'
                let resultFcr = await CONTROLLER.createFCR(arrayListadoSolicitudesFcr, currentClientInfo, session, false)
                results.push(resultFcr)
            } else {
                logger.error('function fcrDeConsulta - Error - fcr de Consulta')
            }

            logger.info(`Error: fcrDeConsulta: ${JSON.stringify(results)}`)
            return results
        } catch (error) {
            logger.error(`Error: fcrDeConsulta: ${JSON.stringify(error)}`)
            return results
        }
    },
    async fcrDeConsultaPorIngresoReclamo(session, generica = true) {
        logger.info('function fcrDeConsulta:')
        let response = {
            error: [],
            success: []
        }
        try {
            let listadoSolicitudesOrdenCompra = session.userData.listadoSolicitudesOrdenCompra
            session.userData.nivel1 = 'Consultas Generales'
            session.userData.nivel2 = 'Estado de Orden de Compra'
            session.userData.nivel3 = 'Estado de Orden de Compra'
            session.userData.motivo = ''
            const arrayListadoSolicitudesFcr = this.validarListadoSolicitudes(listadoSolicitudesOrdenCompra)
            const currentClientInfo = this.validarCurrentClientInfo(session.userData.currentClientInfo)
            if (arrayListadoSolicitudesFcr !== null && currentClientInfo !== null && generica === false) {
                logger.info('fcrDeConsulta - lista para retiro')
                for (const subOrdenObj of session.userData.arraySubOrdenesConRetiroPendiente) {
                    const statusResult = subOrdenObj.macro_steps.find(ObjectStatus => ObjectStatus.status === 'Orden lista para retiro')
                    session.userData.motivo_reclamo = `First Contact Resolution \n Se le indica al cliente que la orden esta lista para retiro cliente ${statusResult.date} fecha lista para retiro cliente.`
                    let resultFcr = await CONTROLLER.createFCR(null, currentClientInfo, session)
                    resultFcr.success.forEach(function(result) {
                        const clone = Object.assign(result, { ss: result.msg })
                        response.success.push(clone)
                    })
                }
            } else if (arrayListadoSolicitudesFcr !== null && currentClientInfo !== null && generica === true) {
                session.userData.motivo_reclamo = 'First Contact Resolution'
                let resultFcr = await CONTROLLER.createFCR(arrayListadoSolicitudesFcr, currentClientInfo, session, false)
                resultFcr.success.forEach(function(result) {
                    const clone = Object.assign(result, { ss: result.msg })
                    response.success.push(clone)
                })
            } else {
                logger.error('function fcrDeConsulta - Error - fcr de Consulta')
            }

            logger.info(`Error: fcrDeConsulta: ${JSON.stringify(response)}`)
            return response
        } catch (error) {
            logger.error(`Error: fcrDeConsulta: ${JSON.stringify(error)}`)
            return response
        }
    },
    async createSSFCRIncumplimientoFecha(session) {
        logger.info('createSSFCRIncumplimientoFecha inicio')
        let response = {
            error: [],
            success: []
        }
        if (session.userData.solicitudesPendientesConIncumplimiento.length > 0) {
            for (const subOrdenSolicitud of session.userData.solicitudesPendientesConIncumplimiento) {
                let flagDuplicidadSS
                flagDuplicidadSS = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(session.userData.rut, session.userData.orderNumber, subOrdenSolicitud.sub_orden.id, 'Incumplimiento fecha Entrega');
                if (!flagDuplicidadSS) {
                    flagDuplicidadSS = []
                }
                session.userData.flagCreate = false
                if (flagDuplicidadSS.length === 0) {
                    let subOrdenesConIncumplimiento = []
                        // Codigo Antiguo
                    const filtrarRetiroEnTiendas = function(subOrden) {
                        // remueve un objeto del array si este esta Orden lista para retiro y (is_delayed === true)
                        let macroStatusLength = subOrden.macro_steps.length - 1
                        return !(subOrden.delivery_status.is_delayed === true && subOrden.macro_steps[macroStatusLength].status === 'Orden lista para retiro')
                    }
                    subOrdenesConIncumplimiento = filtrarRetiroEnTiendas(subOrdenSolicitud.sub_orden)
                    if (subOrdenesConIncumplimiento) {
                        session.userData.subOrdenSolicitud = subOrdenSolicitud
                        let resultCreateSSporIncumplimiento = await this.createSSIncumplimientoFecha(session)

                        // session.userData.resultCreateSSporIncumplimiento = resultCreateSSporIncumplimiento
                        if (resultCreateSSporIncumplimiento) {
                            if (resultCreateSSporIncumplimiento.success) {
                                if (resultCreateSSporIncumplimiento.success.length > 0) {

                                    // console.log('Info:/incumplimiento_fecha - createSS')
                                    logger.info('function: incumplimiento_fecha - createSS')
                                    resultCreateSSporIncumplimiento.success.forEach(function(result) {
                                        const clone = Object.assign(result, { ss: result.msg })
                                        response.success.push(clone)
                                    })

                                    // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                                    transaccionesQuiebres(session, {
                                        name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                                        request: { session },
                                        response: resultCreateSSporIncumplimiento
                                    }, CODIGO.SUCCES)

                                    // Fin de Log IFE

                                }
                            }
                        } else if (resultCreateSSporIncumplimiento.error.length > 0) {

                            resultCreateSSporIncumplimiento.error.forEach(function(result) {
                                const clone = Object.assign(result, { ss: null })
                                response.success.push(clone)
                            })

                            // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                            transaccionesQuiebres(session, {
                                name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                                request: { session },
                                response: `crea_SS_incumplimiento_fecha_entrega response= ${JSON.stringify(resultCreateSSporIncumplimiento)}`
                            }, CODIGO.ERROR_SERVICIO)
                            logger.info(`createSSFCRIncumplimientoFecha return: ${JSON.stringify(response)}`)

                            // Fin de Log IFE

                        }
                        logger.info(`createSSFCRIncumplimientoFecha return: ${JSON.stringify(response)}`)
                            // return response
                    }
                } else if (flagDuplicidadSS.length > 0) {
                    session.userData.nivel1 = 'Consultas Generales'
                    session.userData.nivel2 = 'Estado del reclamo'
                    session.userData.nivel3 = 'Estado del reclamo'
                    session.userData.motivo_reclamo = 'First Contact Resolution'
                    session.userData.motivo = ''
                    session.userData.numeroSubOrdenFCR = flagDuplicidadSS[0].numeroSubOrden
                    session.userData.numeroSSFCR = flagDuplicidadSS[0].numeroSS
                    try {
                        let createFCR = await CONTROLLER.createFCR(null, session.userData.currentClientInfo, session)


                        if (createFCR.success.length > 0) {

                            logger.info('Incumplimiento_fecha - createFCR')
                            createFCR.success.forEach(function(result) {
                                const clone = Object.assign(result, { ss: session.userData.numeroSSFCR })
                                response.success.push(clone)
                            })

                            // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                            transaccionesQuiebres(session, {
                                name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                                request: { 'Contacto': session.userData.currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto, session },
                                response: createFCR
                            }, CODIGO.SUCCES)

                            // Fin de Log IFE

                        } else if (createFCR.error.length > 0) {

                            createFCR.error.forEach(function(result) {
                                const clone = Object.assign(result, { ss: session.userData.numeroSSFCR })
                                response.success.push(clone)
                            })

                            // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                            transaccionesQuiebres(session, {
                                name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                                request: { 'Contacto': session.userData.currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto, session },
                                response: `crea_SS_incumplimiento_fecha_entrega response= ${JSON.stringify(createFCR)}`
                            }, CODIGO.ERROR_SERVICIO)
                            logger.error(`flujo sectionARGS: /creaSSIncumplimientoFecha, ${createFCR.error}`)

                            // Fin de Log IFE
                        }
                    } catch (error) {
                        response.error.push({
                            subOrden: null,
                            msg: 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente <a href="https://www.falabella.com/falabella-cl/mi-cuenta/ordenes">link</a>)'
                        })
                    }
                }
            }
        }

        return response
    },
    /////////////////////  IFEFH /////////////////////////////////////////////
    async createSSFCRIncumplimientoFechaFueraHorario(session) {
        logger.info('createSSFCRIncumplimientoFechaFueraHorario inicio')
        let response = {
            error: [],
            success: []
        }
        if (session.userData.solicitudesPendientesConIFEFueraHorario.length > 0) {
            for (const subOrdenSolicitud of session.userData.solicitudesPendientesConIFEFueraHorario) {
                let flagDuplicidadSS
                flagDuplicidadSS = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(session.userData.rut, session.userData.orderNumber, subOrdenSolicitud.sub_orden.id, 'Incumplimiento fecha Entrega');
                if (!flagDuplicidadSS) {
                    flagDuplicidadSS = []
                }
                session.userData.flagCreate = false
                if (flagDuplicidadSS.length === 0) {
                    let subOrdenesConIFEFHora = []
                        // Codigo Antiguo
                    const filtrarRetiroEnTiendas = function(subOrden) {
                        // remueve un objeto del array si este esta Orden lista para retiro y (is_delayed === true)
                        let macroStatusLength = subOrden.macro_steps.length - 1
                        return !(subOrden.delivery_status.is_delayed === true && subOrden.macro_steps[macroStatusLength].status === 'Orden lista para retiro')
                    }
                    subOrdenesConIFEFHora = filtrarRetiroEnTiendas(subOrdenSolicitud.sub_orden)
                    if (subOrdenesConIFEFHora) {
                        session.userData.subOrdenSolicitud = subOrdenSolicitud
                        let resultCreateSSporIncumplimiento = await this.createSSIncumplimientoFechaPorRangoHora(session)

                        // session.userData.resultCreateSSporIncumplimiento = resultCreateSSporIncumplimiento
                        if (resultCreateSSporIncumplimiento) {
                            if (resultCreateSSporIncumplimiento.success) {
                                if (resultCreateSSporIncumplimiento.success.length > 0) {

                                    // console.log('Info:/incumplimiento_fecha - createSS')
                                    logger.info('function: incumplimiento_fecha - createSS')
                                    resultCreateSSporIncumplimiento.success.forEach(function(result) {
                                        const clone = Object.assign(result, { ss: result.msg })
                                        response.success.push(clone)
                                    })

                                    // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                                    transaccionesQuiebres(session, {
                                        name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                                        request: { session },
                                        response: resultCreateSSporIncumplimiento
                                    }, CODIGO.SUCCES)

                                    // Fin de Log IFEFH

                                }
                            }
                        } else if (resultCreateSSporIncumplimiento.error.length > 0) {

                            resultCreateSSporIncumplimiento.error.forEach(function(result) {
                                const clone = Object.assign(result, { ss: null })
                                response.success.push(clone)
                            })

                            // Log de Transaccional de IFEFH (Imcumplimiento fecha de entrega fuera de horarios) 

                            transaccionesQuiebres(session, {
                                name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                                request: { session },
                                response: `createSSIncumplimientoFechaPorRangoHora response= ${JSON.stringify(resultCreateSSporIncumplimiento)}`
                            }, CODIGO.ERROR_SERVICIO)
                            logger.info(`createSSIncumplimientoFechaPorRangoHora return: ${JSON.stringify(response)}`)

                            // Fin de Log IFE

                        }
                        logger.info(`createSSFCRIncumplimientoFecha return: ${JSON.stringify(response)}`)
                            // return response
                    }
                } // else if (flagDuplicidadSS.length > 0) {
                //     session.userData.nivel1 = 'Consultas Generales'
                //     session.userData.nivel2 = 'Estado del reclamo'
                //     session.userData.nivel3 = 'Estado del reclamo'
                //     session.userData.motivo_reclamo = 'First Contact Resolution'
                //     session.userData.motivo = ''
                //     session.userData.numeroSubOrdenFCR = flagDuplicidadSS[0].numeroSubOrden
                //     session.userData.numeroSSFCR = flagDuplicidadSS[0].numeroSS
                //     try {
                //         let createFCR = await CONTROLLER.createFCR(null, session.userData.currentClientInfo, session)


                //         if (createFCR.success.length > 0) {

                //             logger.info('Incumplimiento_fecha - createFCR')
                //             createFCR.success.forEach(function(result) {
                //                 const clone = Object.assign(result, { ss: session.userData.numeroSSFCR })
                //                 response.success.push(clone)
                //             })

                //             // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                //             transaccionesQuiebres(session, {
                //                 name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                //                 request: { 'Contacto': session.userData.currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto, session },
                //                 response: createFCR
                //             }, CODIGO.SUCCES)

                //             // Fin de Log IFE

                //         } else if (createFCR.error.length > 0) {

                //             createFCR.error.forEach(function(result) {
                //                 const clone = Object.assign(result, { ss: session.userData.numeroSSFCR })
                //                 response.success.push(clone)
                //             })

                //             // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                //             transaccionesQuiebres(session, {
                //                 name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                //                 request: { 'Contacto': session.userData.currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto, session },
                //                 response: `crea_SS_incumplimiento_fecha_entrega response= ${JSON.stringify(createFCR)}`
                //             }, CODIGO.ERROR_SERVICIO)
                //             logger.error(`flujo sectionARGS: /creaSSIncumplimientoFecha, ${createFCR.error}`)

                //             // Fin de Log IFE
                //         }
                //     } catch (error) {
                //         response.error.push({
                //             subOrden: null,
                //             msg: 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente <a href="https://www.falabella.com/falabella-cl/mi-cuenta/ordenes">link</a>)'
                //         })
                //     }
                // }
            }
        }

        return response
    },
    async createSSIncumplimientoFechaPorRangoHora(session) {
        logger.info('function createSSIncumplimientoFechaPorRangoHora')
        try {
            session.userData.nivel1 = 'Despachos'
            session.userData.nivel2 = 'Incumplimiento de fecha'
            session.userData.nivel3 = 'Incumplimiento fecha Entrega'
            session.userData.orderNumber = session.userData.orden_compra
            session.userData.mediopago = await CONTROLLER.obtenerMetodoPago(session)
            session.userData.motivo_reclamo = 'Solicitud de reclamo incumplimiento'
            session.userData.motivo_reclamo += '\n SS creada pasada las 21 horas, ingresada por Seguimiento de Orden'
            session.userData.motivo = ''
            let subOrdersArray = []
                // for (let subOrder of session.userData.arraySubOrdenesConIncumplimientoFecha) {
            subOrdersArray.push(session.userData.subOrdenSolicitud.sub_orden.id)
                // }
            session.userData.resultCreateSS = ''
            let resultCreateSSporIncumplimientoPorRangoHora = await CONTROLLER.subOrdenCreateSS(subOrdersArray, session.userData.currentClientInfo, session)
            logger.info(`createSSIncumplimientoFechaPorRangoHora: ${JSON.stringify(resultCreateSSporIncumplimientoPorRangoHora)}`)
            return resultCreateSSporIncumplimientoPorRangoHora
        } catch (error) {
            logger.error(`createSSIncumplimientoFechaPorRangoHora: ${JSON.stringify(error)}`)
            return null;
        }
    },
    async createSSIncumplimientoFecha(session) {
        logger.info('function createSSIncumplimientoFecha')
        try {
            session.userData.nivel1 = 'Despachos'
            session.userData.nivel2 = 'Incumplimiento de fecha'
            session.userData.nivel3 = 'Incumplimiento fecha Entrega'
            session.userData.orderNumber = session.userData.orden_compra
            session.userData.mediopago = await CONTROLLER.obtenerMetodoPago(session)
            session.userData.motivo_reclamo = 'Solicitud de reclamo incumplimiento'
            session.userData.motivo_reclamo += '\n SS ingresada por Seguimiento de Orden'
            session.userData.motivo = ''
            let subOrdersArray = []
                // for (let subOrder of session.userData.arraySubOrdenesConIncumplimientoFecha) {
            subOrdersArray.push(session.userData.subOrdenSolicitud.sub_orden.id)
                // }
            session.userData.resultCreateSS = ''
            let resultCreateSSporIncumplimiento = await CONTROLLER.subOrdenCreateSS(subOrdersArray, session.userData.currentClientInfo, session)
            logger.info(`createSSIncumplimientoFecha: ${JSON.stringify(resultCreateSSporIncumplimiento)}`)
            return resultCreateSSporIncumplimiento
        } catch (error) {
            logger.error(`createSSIncumplimientoFecha: ${JSON.stringify(error)}`)
            return null;
        }
    },
    async createSSFCRIncumplimientoFecha(session) {
        logger.info('createSSFCRIncumplimientoFecha inicio')
        let response = {
            error: [],
            success: []
        }
        if (session.userData.solicitudesPendientesConIncumplimiento.length > 0) {
            for (const subOrdenSolicitud of session.userData.solicitudesPendientesConIncumplimiento) {
                let flagDuplicidadSS
                flagDuplicidadSS = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(session.userData.rut, session.userData.orderNumber, subOrdenSolicitud.sub_orden.id, 'Incumplimiento fecha Entrega');
                if (!flagDuplicidadSS) {
                    flagDuplicidadSS = []
                }
                session.userData.flagCreate = false
                if (flagDuplicidadSS.length === 0) {
                    let subOrdenesConIncumplimiento = []
                        // Codigo Antiguo
                    const filtrarRetiroEnTiendas = function(subOrden) {
                        // remueve un objeto del array si este esta Orden lista para retiro y (is_delayed === true)
                        let macroStatusLength = subOrden.macro_steps.length - 1
                        return !(subOrden.delivery_status.is_delayed === true && subOrden.macro_steps[macroStatusLength].status === 'Orden lista para retiro')
                    }
                    subOrdenesConIncumplimiento = filtrarRetiroEnTiendas(subOrdenSolicitud.sub_orden)
                    if (subOrdenesConIncumplimiento) {
                        session.userData.subOrdenSolicitud = subOrdenSolicitud
                        let resultCreateSSporIncumplimiento = await this.createSSIncumplimientoFecha(session)

                        // session.userData.resultCreateSSporIncumplimiento = resultCreateSSporIncumplimiento
                        if (resultCreateSSporIncumplimiento) {
                            if (resultCreateSSporIncumplimiento.success) {
                                if (resultCreateSSporIncumplimiento.success.length > 0) {

                                    // console.log('Info:/incumplimiento_fecha - createSS')
                                    logger.info('function: incumplimiento_fecha - createSS')
                                    resultCreateSSporIncumplimiento.success.forEach(function(result) {
                                        const clone = Object.assign(result, { ss: result.msg })
                                        response.success.push(clone)
                                    })

                                    // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                                    transaccionesQuiebres(session, {
                                        name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                                        request: { session },
                                        response: resultCreateSSporIncumplimiento
                                    }, CODIGO.SUCCES)

                                    // Fin de Log IFE

                                }
                            }
                        } else if (resultCreateSSporIncumplimiento.error.length > 0) {

                            resultCreateSSporIncumplimiento.error.forEach(function(result) {
                                const clone = Object.assign(result, { ss: null })
                                response.success.push(clone)
                            })

                            // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                            transaccionesQuiebres(session, {
                                name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                                request: { session },
                                response: `crea_SS_incumplimiento_fecha_entrega response= ${JSON.stringify(resultCreateSSporIncumplimiento)}`
                            }, CODIGO.ERROR_SERVICIO)
                            logger.info(`createSSFCRIncumplimientoFecha return: ${JSON.stringify(response)}`)

                            // Fin de Log IFE

                        }
                        logger.info(`createSSFCRIncumplimientoFecha return: ${JSON.stringify(response)}`)
                            // return response
                    }
                } else if (flagDuplicidadSS.length > 0) {
                    session.userData.nivel1 = 'Consultas Generales'
                    session.userData.nivel2 = 'Estado del reclamo'
                    session.userData.nivel3 = 'Estado del reclamo'
                    session.userData.motivo_reclamo = 'First Contact Resolution'
                    session.userData.motivo = ''
                    session.userData.numeroSubOrdenFCR = flagDuplicidadSS[0].numeroSubOrden
                    session.userData.numeroSSFCR = flagDuplicidadSS[0].numeroSS
                    try {
                        let createFCR = await CONTROLLER.createFCR(null, session.userData.currentClientInfo, session)


                        if (createFCR.success.length > 0) {

                            logger.info('Incumplimiento_fecha - createFCR')
                            createFCR.success.forEach(function(result) {
                                const clone = Object.assign(result, { ss: session.userData.numeroSSFCR })
                                response.success.push(clone)
                            })

                            // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                            transaccionesQuiebres(session, {
                                name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                                request: { 'Contacto': session.userData.currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto, session },
                                response: createFCR
                            }, CODIGO.SUCCES)

                            // Fin de Log IFE

                        } else if (createFCR.error.length > 0) {

                            createFCR.error.forEach(function(result) {
                                const clone = Object.assign(result, { ss: session.userData.numeroSSFCR })
                                response.success.push(clone)
                            })

                            // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 

                            transaccionesQuiebres(session, {
                                name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA,
                                request: { 'Contacto': session.userData.currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto, session },
                                response: `crea_SS_incumplimiento_fecha_entrega response= ${JSON.stringify(createFCR)}`
                            }, CODIGO.ERROR_SERVICIO)
                            logger.error(`flujo sectionARGS: /creaSSIncumplimientoFecha, ${createFCR.error}`)

                            // Fin de Log IFE
                        }
                    } catch (error) {
                        response.error.push({
                            subOrden: null,
                            msg: 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente <a href="https://www.falabella.com/falabella-cl/mi-cuenta/ordenes">link</a>)'
                        })
                    }
                }
            }
        }

        return response
    },
    async createSSIncumplimientoPosibleTE(session) {
        logger.info('function createSSIncumplimientoPosibleTE')
        try {
            session.userData.nivel1 = 'Despachos'
            session.userData.nivel2 = 'Incumplimiento de fecha'
            session.userData.nivel3 = 'Incumplimiento fecha Entrega'
            session.userData.orderNumber = session.userData.orden_compra
            session.userData.mediopago = await CONTROLLER.obtenerMetodoPago(session)
            session.userData.motivo_reclamo += '\n Posible Total Entrega Falso'
            session.userData.motivo_reclamo += '\n SS ingresada por Ingreso de Solicitud.'
            session.userData.motivo = ''
            let subOrdersArray = []
                // for (let subOrder of session.userData.arraySubOrdenesConIncumplimientoFecha) {
            subOrdersArray.push(session.userData.subOrdenSolicitud.sub_orden.id)
                // }
            session.userData.resultCreateSS = ''
            let resultCreateSS = await CONTROLLER.subOrdenCreateSS(subOrdersArray, session.userData.currentClientInfo, session)
            logger.info(`createSSIncumplimientoPosibleTE: ${JSON.stringify(resultCreateSS)}`)
            return resultCreateSS
        } catch (error) {
            logger.error(`createSSIncumplimientoPosibleTE: ${JSON.stringify(error)}`)
            return null;
        }
    },
    async createSSFCRPosilibleTotalEntregaF(session) {
        logger.info('createSSFCRPosilibleTotalEntregaF inicio')
        let response = {
            error: [],
            success: []
        }
        session.userData.motivo_reclamo = ""
        if (session.userData.solicitudesPendientesPosibleTotalEntrega.length > 0) {
            for (const subOrdenSolicitud of session.userData.solicitudesPendientesPosibleTotalEntrega) {
                let flagDuplicidadSS
                flagDuplicidadSS = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(session.userData.rut, session.userData.orderNumber, subOrdenSolicitud.sub_orden.id, 'Incumplimiento fecha Entrega');
                if (!flagDuplicidadSS) {
                    flagDuplicidadSS = []
                }
                if (flagDuplicidadSS.length === 0) {
                    session.userData.subOrdenSolicitud = subOrdenSolicitud
                    let resultCreateSS = await this.createSSIncumplimientoPosibleTE(session)
                    if (resultCreateSS) {
                        if (resultCreateSS.success) {
                            if (resultCreateSS.success.length > 0) {
                                resultCreateSS.success.forEach(function(result) {
                                        const clone = Object.assign(result, { ss: result.msg })
                                        response.success.push(clone)
                                    })
                                    //Log de Transaccional de IFE(Imcumplimiento Posible TEF) 
                                transaccionesQuiebres(session, {
                                        name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA_PTEF,
                                        request: { session },
                                        response: resultCreateSS
                                    }, CODIGO.SUCCES)
                                    // Fin de Log IFE
                            }
                        }
                    } else if (resultCreateSS.error.length > 0) {
                        resultCreateSS.error.forEach(function(result) {
                                const clone = Object.assign(result, { ss: null })
                                response.error.push(clone)
                            })
                            // Log de Transaccional de IFE
                        transaccionesQuiebres(session, {
                            name: SERVICE.createSSFCRPosilibleTotalEntregaF,
                            request: { session },
                            response: `crea_SS_incumplimiento_fecha_posible_total_entrega_falso response= ${JSON.stringify(resultCreateSS)}`
                        }, CODIGO.ERROR_SERVICIO)
                        logger.info(`createSSFCRPosilibleTotalEntregaF return: ${JSON.stringify(response)}`)
                            // Fin de Log IFE
                    }
                    logger.info(`createSSFCRPosilibleTotalEntregaF return: ${JSON.stringify(response)}`)
                        // return response

                } else if (flagDuplicidadSS.length > 0) {
                    session.userData.nivel1 = 'Consultas Generales'
                    session.userData.nivel2 = 'Estado del reclamo'
                    session.userData.nivel3 = 'Estado del reclamo'
                    session.userData.motivo_reclamo = 'First Contact Resolution'
                        // session.userData.motivo_reclamo += '\n Posible Total Entrega Falso'
                        // session.userData.motivo_reclamo += '\n SS ingresada por Ingreso de Solicitud.'
                    session.userData.motivo = ''
                    session.userData.numeroSubOrdenFCR = flagDuplicidadSS[0].numeroSubOrden
                    session.userData.numeroSSFCR = flagDuplicidadSS[0].numeroSS
                    try {
                        let createFCR = await CONTROLLER.createFCR(null, session.userData.currentClientInfo, session)
                        if (createFCR.success.length > 0) {
                            logger.info('createSSFCRPosilibleTotalEntregaF - createFCR')
                            createFCR.success.forEach(function(result) {
                                    const clone = Object.assign(result, { ss: session.userData.numeroSSFCR })
                                    response.success.push(clone)
                                })
                                // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 
                            transaccionesQuiebres(session, {
                                    name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA_PTEF,
                                    request: { 'Contacto': session.userData.currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto, session },
                                    response: createFCR
                                }, CODIGO.SUCCES)
                                // Fin de Log IFE
                        } else if (createFCR.error.length > 0) {
                            createFCR.error.forEach(function(result) {
                                    const clone = Object.assign(result, { ss: session.userData.numeroSSFCR })
                                    response.error.push(clone)
                                })
                                // Log de Transaccional de IFE(Imcumplimiento fecha de entrega) 
                            transaccionesQuiebres(session, {
                                name: SERVICE.CREASS_INCUMPLIMIENTO_FECHA_PTEF,
                                request: { 'Contacto': session.userData.currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto, session },
                                response: `createSSFCRPosilibleTotalEntregaF response= ${JSON.stringify(createFCR)}`
                            }, CODIGO.ERROR_SERVICIO)
                            logger.error(`flujo sectionARGS: /createSSFCRPosilibleTotalEntregaF, ${createFCR.error}`)
                                // Fin de Log IFE
                        }
                    } catch (error) {
                        response.error.push({
                            subOrden: null,
                            msg: 'Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente <a href="https://www.falabella.com/falabella-cl/mi-cuenta/ordenes">link</a>)'
                        })
                    }
                }
            }
        }

        return response
    },
    async creaFCRQuiebre(session) {
        try {
            logger.info('function: creaFCRQuiebre inicio')
                // FCR QUIEBRE
            let flagDuplicidadSSQuiebre
            if (session.userData.subOrdersArray.length > 0) {
                for (let subOrdenArray of session.userData.subOrdersArray) {
                    flagDuplicidadSSQuiebre = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(session.userData.rut, session.userData.orden_compra, subOrdenArray.id, 'Incumplimiento Sin Stock')
                }
            } else {
                flagDuplicidadSSQuiebre = []
            }
            let result = {
                quiebreFCR: null,
                error: []
            }
            if (flagDuplicidadSSQuiebre.length > 0 && session.userData.subOrdersArray.length > 0) {
                session.userData.nivel1 = 'Consultas Generales'
                session.userData.nivel2 = 'Estado del reclamo'
                session.userData.nivel3 = 'Estado del reclamo'
                session.userData.motivo_reclamo = 'First Contact Resolution'
                session.userData.motivo = ''
                session.userData.numeroSubOrdenFCR = flagDuplicidadSSQuiebre[0].numeroSubOrden
                session.userData.numeroSSFCR = flagDuplicidadSSQuiebre[0].numeroSS

                let _quiebreFCR = await CONTROLLER.createFCR(null, session.userData.currentClientInfo, session)
                if (_quiebreFCR.success.length > 0) {
                    result.quiebreFCR = _quiebreFCR
                } else {
                    result.error.push(_quiebreFCR)
                }
                logger.info(`creaFCRQuiebre return, ${JSON.stringify(result)}`)
                return result
            }
        } catch (error) {
            logger.error(`Error: creaFCRQuiebre, ${error}`)
            return null;
        }
        // FCR QUIEBRE
    },
    async creaSSQuiebre(session) {
        try {
            logger.info('creaSSQuiebre inicio')
                /* Existe quiebre en una o varias subórdenes de la orden de compra pero no existe SS creada, se procede a crear una SS */
            session.userData.nivel1 = 'Despachos'
            session.userData.nivel2 = 'Incumplimiento de fecha'
            session.userData.nivel3 = 'Incumplimiento Sin Stock'
                // session.userData.nivel3 = 'Incumplimiento fecha Entrega' CM
            session.userData.motivo_reclamo = 'Solicitud de incumplimiento sin stock creada por Amanda'
            session.userData.motivo = 'Arrepentimiento'
            session.userData.orderNumber = session.userData.orden_compra
            session.userData.mediopago = await CONTROLLER.obtenerMetodoPago(session)
            let subOrdersArray = []
            for (let subOrder of session.userData.subOrdersArray) {
                subOrdersArray.push(subOrder.id)
            }
            let subOrdenCreateSS = await CONTROLLER.subOrdenCreateSS(subOrdersArray, session.userData.currentClientInfo, session)
                // console.log(subOrdenCreateSS)
            logger.info(`creaSSQuiebre return, ${JSON.stringify(subOrdenCreateSS)}`)
            return subOrdenCreateSS
                // session.send(reclamoMsg)
                // session.endConversation()
        } catch (error) {
            logger.error(`function: creaFCRQuiebre, ${error}`)
            return null;
        }
    },
    validarListadoSolicitudes(listadoSolicitudesOrdenCompra) {
        if (listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput != null && listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp != null) {
            if (listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.mensajeError === 'OK' && listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener.length > 0) {
                return listadoSolicitudesOrdenCompra.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener
            } else {
                logger.error('validarListadoSolicitudes - validarListadoSolicitudes = null')
                return null
            }
        }
    },
    validarCurrentClientInfo(currentClientInfo) {
        if (typeof currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse !== 'undefined' && currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse !== null) {
            if (currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto.length > 0) {
                return currentClientInfo
            } else {
                logger.error('validarCurrentClientInfo - fcrGenerica - validarCurrentClientInfo = null')
                return null
            }
        }
    },
    validarActividadQuiebre(solicitudExistenteDetalleObtener, subTipo) {
        let actividades = solicitudExistenteDetalleObtener.SolicitudDetalleObtenerOutput.SolicitudDetalleObtenerResp.SolicitudDetalleObtener.ListaDeActividades.Actividades
        let flag_crea_duplicada_actividad = true
        for (let actividad of actividades) {
            if (actividad.tipo === 'BackOffice' && actividad.subTipo === subTipo && (actividad.estado === 'Asignada' || actividad.estado === 'En proceso')) {
                flag_crea_duplicada_actividad = false
            }
        }
        return flag_crea_duplicada_actividad
    },
    actividadesEnCurso(actividades) {
        const actividadesEnCurso = Filtrar(actividades, (actividad) => ['Verificar SS', 'Contacto Inicial', 'Enviar correo'].includes(actividad.subTipo))
        return (actividadesEnCurso.length > 0) ? true : false
    },
    async existeSSIncumplimientoSinStock(arrayListadoSolicitudes) {
        let _flag_existe_solicitud = false
        let _numero_solicitud_existente = ''
        let _solicitudQuiebre = ''
        for (let solicitud of arrayListadoSolicitudes) {
            if (solicitud.nivel3 === 'Incumplimiento Sin Stock' && solicitud.estado === 'Abierto') {
                _solicitudQuiebre = solicitud
                    // session.userData.solicitudQuiebre = solicitud
                _numero_solicitud_existente = solicitud.numeroSS
                _flag_existe_solicitud = true
                break
            }
        }
        return {
            flag_existe_solicitud: _flag_existe_solicitud,
            numero_solicitud_existente: _numero_solicitud_existente,
            solicitudQuiebre: _solicitudQuiebre
        }
    }
}
const QUIEBRE ={

    async dataQuiebre(dataBO){
        let responseBO ={
            cant:0,
            mensaje_portal:'',
            detalle_producto:''

        }
        try {
            nunBO = dataBO.customer.length
            let msg_portal = 'Lo sentimos, algunos productos <b>no pudieron ser entregados.</b> Por este motivo haremos la'
            + '<b>devolución de tu dinero,</b> el que recitirás a través del mismo medio de pago utilizado en tu compra.'
            dataBO.customer.forEach(e => { 
               if(nunBO == 1 || e.portal_status.toLowerCase().trim() == 'ofrecer opciones'){
                msg_portal = e.message_portal
               }
            });
            
            let listaProduc = '<br><h5><ol>'
            dataBO.allBreakProducts.forEach( s =>{
              s.breakProducts.forEach( pr =>{ 
                listaProduc+= '<li type="square">'+pr.description_break_product+'</li>'
              })
              listaProduc+='<hr>'
            }) 
            listaProduc+='</ol></h5>'
            responseBO.cant=nunBO
            responseBO.mensaje_portal = msg_portal
            responseBO.detalle_producto= listaProduc
    
           return responseBO
        } catch (error) {
            responseBO.mensaje_portal = 'error_funcion'
            responseBO.detalle_producto= 'error_funcion'
    
           return responseBO
        }
          }
}
// module.exports = (function (TIPOLOGIA, SOLICITUD) {
//     this.TIPOLOGIA = TIPOLOGIA
//     this.SOLICITUD = SOLICITUD
//     return this
// }(TIPOLOGIA, SOLICITUD))

module.exports = {
    TIPOLOGIA,
    SOLICITUD,
    TIPO_SOLICITUD,
    QUIEBRE
}