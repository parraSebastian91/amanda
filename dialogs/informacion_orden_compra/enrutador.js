require('./../../functions/ingresoDatos/sectionEndConversation')
require('./solucion_total_entrega_falso')
require('./incumplimiento_sin_stock')

const { TIPOLOGIA, SOLICITUD, TIPO_SOLICITUD, QUIEBRE } = require('./functions')
const existeSolicitudPendiente = TIPOLOGIA.existeSolicitudPendiente
const tieneIncumplimientoFechaArray = TIPOLOGIA.tieneIncumplimientoFechaArray
const tieneIncumplimientoFechaFueraHorarioArray = TIPOLOGIA.tieneIncumplimientoFechaFueraHorarioArray
const agregarEstadoSolPendiente = TIPOLOGIA.agregarEstadoSolPendiente
const { MensajeDeAyuda, AdaptiveCard, OfuscarCorreo } = require('../../utils')
const { mostrarProducto } = require('./../../utils/seguimiento')
const logger = require('./../../utils/logger')
const text = require('./text')
const { getSsDatoQuiebre } = require('./../../__services/quiebres/backoffice')
const RESPALDO_CORREO = 'Te hemos enviado un respaldo de tu solicitud al correo {{correo}}'

bot.dialog('/enrutador', [
    async (session, args, next) => {
        try {
            session.userData.dataProgram.ServiceOn = true // impide que el mensaje ingresado por usuario genere actividad dentro del BOT
            let isBroken = false
            logger.info('dialogo: enrutador, inicio.')
            let solicitudesPendientes = session.userData.solicitudesPendientes
            const solicitudesPendientesConIncumplimiento = tieneIncumplimientoFechaArray(solicitudesPendientes)
            const solicitudesPendientesConIFEFueraHorario = tieneIncumplimientoFechaFueraHorarioArray(solicitudesPendientes)

            if (existeSolicitudPendiente(solicitudesPendientes, TIPO_SOLICITUD.REAGENDAMIENTO_CON_INCUMPLIMIENTO)) {
                // session.userData.subOrderIncReagendamientoArray = TIPOLOGIA.filtrarSolConIncReagendamiento(solicitudesPendientes)
                session.userData.subOrderIncReagendamientoArray = TIPOLOGIA.filtrarSolicitudesArray(solicitudesPendientes, TIPO_SOLICITUD.REAGENDAMIENTO_CON_INCUMPLIMIENTO)
                let infoIncReagendamiento = await SOLICITUD.createSsFcrReagendamiendo(session)
                session.userData.solicitudesPendientes = agregarEstadoSolPendiente(solicitudesPendientes, infoIncReagendamiento)
            }
            if (existeSolicitudPendiente(solicitudesPendientes, TIPO_SOLICITUD.INC_SIN_STOCK_REAGENDADO)) {
                session.userData.subOrdersIncSinStockReagendado = TIPOLOGIA.filtrarSolicitudesArray(solicitudesPendientes, TIPO_SOLICITUD.INC_SIN_STOCK_REAGENDADO)
                SOLICITUD.fcrIncumplimientoSinStockReagendado(session)
            }
            if (solicitudesPendientesConIncumplimiento.length > 0) {
                session.userData.solicitudesPendientesConIncumplimiento = solicitudesPendientesConIncumplimiento
                let infoIncumplimientoFecha = await SOLICITUD.createSSFCRIncumplimientoFecha(session)
                if (infoIncumplimientoFecha !== null) {
                    session.userData.solicitudesPendientes = agregarEstadoSolPendiente(solicitudesPendientes, infoIncumplimientoFecha)
                }
            }
            if (solicitudesPendientesConIFEFueraHorario.length > 0) {
                session.userData.solicitudesPendientesConIFEFueraHorario = solicitudesPendientesConIFEFueraHorario
                let infoIncumplimientoFechaFueraHorario = await SOLICITUD.createSSFCRIncumplimientoFechaFueraHorario(session)
                if (infoIncumplimientoFechaFueraHorario !== null) {
                    session.userData.solicitudesPendientes = agregarEstadoSolPendiente(solicitudesPendientes, infoIncumplimientoFechaFueraHorario)
                }
            }
            if (session.userData.solicitudesPendientes.length > 0) {
                if (session.userData.solicitudesPendientesLength === 1) {
                    session.userData.solicitudesPendientesLength++
                    //Validación para cambiar textos de quiebre nuevo en el AdaptiveCard
                    if (process.env.SEGUIMIENTO_QUIEBRE_ORIGINAL == "false" && session.userData.solicitudesPendientes[0].dialogo == TIPO_SOLICITUD.INCUMPLIMIENTO_SIN_STOCK) {
                        isBroken = true
                    }
                    let quiebbreBo = await getSsDatoQuiebre(session.userData.orden_compra, true)
                    const consultasGenerales = ''
                    if (quiebbreBo.success!=false && quiebbreBo.customer.length > 0) {
                        let detalleQuiebre = await QUIEBRE.dataQuiebre(quiebbreBo)
                        const titulo = 'Lo sentimos, algunos productos <b> no pudieron ser entregados:</b>'
                        // session.send(titulo+ detalleQuiebre.detalle_producto+detalleQuiebre.mensaje_portal)
                        session.send(titulo+detalleQuiebre.mensaje_portal)
                    } else {
                        let productosBody = mostrarProducto(session.userData.solicitudesPendientes, isBroken)
                        consultasGenerales = session.userData.solicitudesPendientes.filter((c) => {
                            return c.dialogo === TIPO_SOLICITUD.CONSULTAS_GENERALES
                        })
                        session.send(AdaptiveCard(session, productosBody))


                    }



                    if (consultasGenerales.length === session.userData.solicitudesPendientes.length) {
                        session.send(text.solicitudSinInconveniente)
                    }

                    if (TIPOLOGIA.existenSolicitudesPorTipologia(solicitudesPendientes, [TIPO_SOLICITUD.REAGENDAMIENTO_CON_INCUMPLIMIENTO, TIPO_SOLICITUD.INCUMPLIMIENTO_FECHA, TIPO_SOLICITUD.INC_SIN_STOCK_REAGENDADO])) {
                        session.send(RESPALDO_CORREO.replace('{{correo}}', OfuscarCorreo(session.userData.email)))
                    }

                    // session.userData.solicitudesPendientes = await TIPOLOGIA.removerSolicitudesIncReagendamiento(solicitudesPendientes)
                    // session.userData.solicitudesPendientes = await TIPOLOGIA.removerSolicitudesConIncumplimiento(solicitudesPendientes)
                    session.userData.solicitudesPendientes = await TIPOLOGIA.removerSolicitudes(solicitudesPendientes, [TIPO_SOLICITUD.REAGENDAMIENTO_CON_INCUMPLIMIENTO, TIPO_SOLICITUD.INCUMPLIMIENTO_FECHA, TIPO_SOLICITUD.INC_SIN_STOCK_REAGENDADO])
                    // session.userData.solicitudesPendientes = await TIPOLOGIA.removerSolicitudes(solicitudesPendientes, )
                    // session.userData.solicitudesPendientes = await TIPOLOGIA.removerSolicitudes(solicitudesPendientes, )
                }
                next()
            } else {
                logger.debug('dialogo: enrutador, Sin solicitudes.')
                session.beginDialog('/end_conversation')
                // session.endConversation()
                // MensajeDeAyuda(session)
            }
        } catch (error) {
            logger.error(`Dialog:/enrutador linea 60; ${JSON.stringify(error)}`)
            session.userData.solicitudesPendientesLength = 1
            session.userData.solicitudesPendientes = []
            session.beginDialog('/end_conversation') // Homologacion 3 de septiembre 2019
                // session.endConversation()
                // MensajeDeAyuda(session)
        }
    },
    async (session, results, next) => {
        try {
            let solicitudesPendientes = session.userData.solicitudesPendientes
            if (existeSolicitudPendiente(solicitudesPendientes, TIPO_SOLICITUD.LISTO_RETIRO_TIENDAS)) {
                logger.info('Dialogo:enrutador - Listo para retiro tiendas')
                session.userData.arraySubOrdenesConRetiroPendiente = solicitudesPendientes
                    .filter((i) => i.dialogo === TIPO_SOLICITUD.LISTO_RETIRO_TIENDAS)
                    .map((i) => i.sub_orden)
                SOLICITUD.fcrDeConsulta(session, false)
                // session.userData.solicitudesPendientes = await TIPOLOGIA.removerSolicitudesListaRetiroEnTiendas(solicitudesPendientes)
                session.userData.solicitudesPendientes = await TIPOLOGIA.removerSolicitudes(solicitudesPendientes, [TIPO_SOLICITUD.LISTO_RETIRO_TIENDAS])
            }
            if (existeSolicitudPendiente(solicitudesPendientes, TIPO_SOLICITUD.CONSULTAS_GENERALES)) {
                SOLICITUD.fcrDeConsulta(session, true)
                // session.userData.solicitudesPendientes = await TIPOLOGIA.removerSolicitudesGenerales(solicitudesPendientes)
                session.userData.solicitudesPendientes = await TIPOLOGIA.removerSolicitudes(solicitudesPendientes, [TIPO_SOLICITUD.CONSULTAS_GENERALES])
            }
            if (session.userData.solicitudesPendientes.length > 0) {
                switch (session.userData.solicitudesPendientes[0].dialogo) {
                    case TIPO_SOLICITUD.TOTAL_ENTREGA_FALSO:
                        session.beginDialog('/solucion_total_entrega_falso')
                        break
                    case TIPO_SOLICITUD.INCUMPLIMIENTO_SIN_STOCK:
                        session.beginDialog('/incumplimiento_sin_stock')
                        break
                    default:
                        logger.info(`solicitudesPendientes - switch:default; solicitudesPendientes=${JSON.stringify(session.userData.solicitudesPendientes)}`)
                        session.beginDialog('/end_conversation')
                    // session.endConversation()
                    // MensajeDeAyuda(session)
                }
            } else {
                logger.debug('###### Limpiando variables del enrutador ########')
                session.userData.solicitudesPendientesLength = 1
                session.userData.solicitudesPendientes = []
                session.beginDialog('/end_conversation')
                // session.endConversation()
                // MensajeDeAyuda(session)
            }
        } catch (error) {
            logger.error(`Error:/enrutador - Waterfall 2; ${JSON.stringify(error)}`)

        }
    }
])