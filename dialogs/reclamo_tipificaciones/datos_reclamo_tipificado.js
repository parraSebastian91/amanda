require('./../ingreso_reclamo/reclamo_generico')
require('./../../functions/ingresoDatos/sectionEndConversation')
const {validarFechaSessionActiva} = require('./../../functions/validaciones/fecha')
const { validacionRutMailPorOC } = require('./../../functions/validaciones/validaRutMailEnOC')

bot.dialog('/datos_reclamo_tipificado', [
    async (session, args, next) => {
        session.send(args)
        if (!validarFechaSessionActiva(session.userData)) {
            session.beginDialog('/sectionRun')
        } else {
            session.userData.rut = session.userData.dataPersonal.rutUsuario
            next()
        }
    },
    (session, args, next) => {
        if (!validarFechaSessionActiva(session.userData)) {
            session.userData.dialogRetry = 1
            session.beginDialog('/sectionEmail')
        } else {            
            next({ 'response': session.userData.dataPersonal.emailUsuario})
        }
    },
    (session, results, next) => {
        session.userData.email = results.response
        session.beginDialog('/sectionOC')
    },
    async (session, results, next) => {
        session.userData.orderNumber = results.response
        const datosCliente = await validacionRutMailPorOC(session.userData, false)
        if (!datosCliente.datosOK) {
            session.beginDialog('/end_conversation', { mensaje: datosCliente.mensaje })
            // session.send(datosCliente.mensaje)
            // MensajeDeAyuda(session)
            // session.endConversation()
        } else {
            next()
        }
    },
    async (session, results, next) => {
        session.beginDialog('/sectionPhone')
    },
    async (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    }
])