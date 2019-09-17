require('./../../../functions/ingresoDatos/sectionEndConversation')
require('./boletas_y_cobros')
require('./consulta_novios')
require('./despachos')
require('./experiencia_compra')
require('./problema_con_producto')
require('./problema_servicio')
require('./../../../functions/ingresoDatos/sectionPhone')
require('./../../../functions/ingresoDatos/sectionRun')
require('./../../../functions/ingresoDatos/sectionEmail')
const validarFechaSessionActiva = require("./../../../functions/validaciones/fecha").validarFechaSessionActiva
    //require('./../../../functions/login/sectionLogin')
require('../../../functions/ingresoDatos/sectionOCValidadorPalabras')
const intentLuis = require("../../../functions/salidaDinamica")
const { MensajeDeAyuda } = require('../../../utils')
const { validacionRutMailPorOC } = require('./../../../functions/validaciones/validaRutMailEnOC')
    // require('./../../../functions/ingresoDatos/sectionOC')

bot.dialog('/reclamo_internet_fono', [
    // (session, args, next) => {
    //   session.userData.dataProgram.sessionActiva = false
    //   session.beginDialog('/sectionLogin')
    // },


    (session, results, next) => {
        if (!validarFechaSessionActiva(session.userData)) {
            //if (!session.userData.dataProgram.sessionActiva) {
            session.beginDialog("/sectionRun")
        } else {
            next()
        }
    },
    async(session, results, next) => {
        session.userData.dialogRetry = 1
        if (!session.userData.dataProgram.sessionActiva) {
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
        }
        session.userData.dialogRetryOC = 1
        session.beginDialog('/sectionOCValidadorPalabras')
            // session.beginDialog('/sectionOC')
    },

    //*****************************************************************
    // Se comenta solicitud de telefono con fecha de 21-01-2019 
    // historia SAC-905
    //*****************************************************************
    // async (session, results, next) => {
    //   if (!validarFechaSessionActiva(session.userData)) {
    //     //if (!session.userData.dataProgram.sessionActiva) {
    //     session.userData.dialogretry = 1
    //     session.userData.orderNumber = results.response
    //     session.beginDialog('/sectionPhone')
    //   } else {
    //     next()
    //   }
    // },
    //*****************************************************************


    // (session, args, next) => {
    //   switch (session.userData.sectionDialog) {
    //     case '/sectionRun':
    //       session.beginDialog('/sectionRun')
    //       break
    //     case '/sectionEmail':
    //       session.beginDialog('/sectionEmail')
    //       break
    //     case '/sectionPhone':
    //       session.beginDialog('/sectionPhone')
    //       break
    //     default:
    //       session.beginDialog('/sectionRun')
    //   }
    // },
    async(session, args, next) => {
        const datosCliente = await validacionRutMailPorOC(session.userData, false)
        if (!datosCliente.datosOK) {
            session.beginDialog('/end_conversation', { mensaje: datosCliente.mensaje })
            // session.send(datosCliente.mensaje)
            // MensajeDeAyuda(session)
            // session.endConversation()
        } else {
            // Se comenta Experiencia Compra por historia jira 1437

            // const menuOptions = `Pagos y Cobros|Despachos|Consulta Novios|Consulta Garantía Extendida|Experiencia Compra|Armado de Muebles`
            const menuOptions = `Pagos y Cobros|Despachos|Consulta Novios|Consulta Garantía Extendida|Armado de Muebles`
            const menuText = 'Tú solicitud tiene relación con: '
            builder.Prompts.choice(session, menuText, menuOptions, {
                listStyle: builder.ListStyle.button,
                maxRetries: 0
            })
        }
    },
    async(session, results, next) => {
        if (!results.resumed) {
            switch (results.response.entity) {
                case 'Pagos y Cobros':
                    session.userData.nivel1 = 'Boletas y Cobros'
                    session.beginDialog('/boletas_y_cobros')
                    break
                case 'Despachos':
                    session.userData.nivel1 = 'Despachos'
                    session.beginDialog('/despachos')
                    break
                case 'Consulta Novios':
                    //session.userData.requirePayMethod = true;
                    session.userData.nivel1 = 'Novios'
                    session.beginDialog('/consulta_novios')
                    break
                case 'Consulta Garantía Extendida':
                    session.userData.nivel1 = 'Prod, Servicios y Gift Card'
                    session.beginDialog('/problema_servicio')
                    break
                case 'Experiencia Compra':
                    session.userData.nivel1 = 'Experiencia de compra'
                    session.beginDialog('/experiencia_compra')
                    break
                case 'Armado de Muebles':
                    session.userData.nivel1 = 'Prod, Servicios y Gift Card'
                    session.userData.nivel2 = 'Servicio Armado de Muebles'
                    session.beginDialog('/armado_de_muebles')
                    break
                    /*case 'Problema con Producto':
                      session.userData.nivel1 = 'Gestión sobre el producto'
                      session.beginDialog('/problema_con_producto')
                      break*/
            }
        } else {
            let resultIntent = await intentLuis.dialogIntent(session)
            session.beginDialog(`/${resultIntent}`)
            return
        }
    }
])