require('./../../functions/ingresoDatos/sectionPhone')
require('./../../functions/ingresoDatos/sectionRunFeedback')
require('./../ingreso_reclamo')
require('./../solicitud_callback')
const moment = require('moment')
const messages = require('./../../functions/messages')
const { CODIGO, SERVICE } = require('./../../utils/control_errores')
const { transaccionesQuiebres } = require('../../utils')

bot.dialog('/negativefeedback', [
    (session, args, next) => {
        builder.Prompts.text(session, 'Lo siento, ¿Cómo puedo mejorar?')
    },
    async(session, results, next) => {
        const getSentiment = await SENTIMENT.getSentiment(results.response)
        logs.logFeedback(results, getSentiment, session.userData.pathOrigenFeedback)

        if (getSentiment.documents[0].score >= 0 && getSentiment.documents[0].score <= 0.3) {
            let flagFlechaBloqueadaCallback = await GENESYS.validarBloqueoDiaCallback('Falabella_SAC_CH')
            if (!flagFlechaBloqueadaCallback) {
                if (moment().hours() >= 9 && moment().hours() < 21) {
                    const menuOptions = `SI|NO`
                    const menuText = '¿Quieres recibir un llamado?'
                    session.privateConversationData.sectionDialog = '/solicitud_callback'
                    builder.Prompts.choice(session, menuText, menuOptions, { listStyle: builder.ListStyle.button, maxRetries: 2 })
                } else {
                    session.send('Queremos ayudarte, es por esto que te damos la opción de contactarte con nuestros ejecutivos. Nuestro horario de atención es de 9:00 a 21:00 horas')
                    session.endConversation()
                }
            } else {
                session.beginDialog('/ingreso_reclamo')
            }
        }

        if (getSentiment.documents[0].score > 0.3 && getSentiment.documents[0].score <= 0.5) {
            session.beginDialog('/ingreso_reclamo')
        } else if (getSentiment.documents[0].score > 0.5 && getSentiment.documents[0].score <= 0.7) {
            const menuOptions = `SI|NO`
            const menuText = '¿Quieres realizar un reclamo?'
            session.userData.sectionDialog = '/ingreso_reclamo'
            builder.Prompts.choice(session, menuText, menuOptions, { listStyle: builder.ListStyle.button })
        } else if (getSentiment.documents[0].score > 0.7) {
            session.send('Gracias, tomaré en cuenta tu comentario para mejorar.')
            session.endConversation()
        }
    },
    (session, results, next) => {
        if (session.userData.sectionDialog === '/ingreso_reclamo') {
            console.log(results.response)
            switch (results.response.entity) {
                case 'SI':
                    session.beginDialog('/ingreso_reclamo')
                    next()
                    break
                case 'NO':
                    session.send(messages.getNegativeMessage())
                    session.endConversation()
                    break
            }
        } else if (session.privateConversationData.sectionDialog === '/solicitud_callback' && results.response.entity === 'SI') {
            session.beginDialog('/solicitud_callback')
        } else {
            switch (results.response.entity) {
                case 'SI':
                    session.userData.sectionDialog = '/sectionRunFeedback';
                    next()
                    break
                case 'NO':
                    session.send(messages.getNegativeMessage())
                    session.endConversation()
                    break
            }
        }
    },
    (session, results, next) => {
        switch (session.userData.sectionDialog) {
            case '/sectionRunFeedback':
                session.beginDialog('/sectionRunFeedback')
                break
            case '/sectionPhone':
                session.beginDialog('/sectionPhone')
                break
            default:
                session.endConversation()
        }
    },
    async(session, results, next) => {

        const info = {
            rut: session.userData.rut,
            phone: session.userData.telefono,
            nombreCtc: 'Amanda Detractor',
            apellidoCtc: 'Apellido',
            mailCh: 'mail'
        }

        session.userData.currentClientInfo = await new Promise(
            (resolve, reject) => {
                resolve(SIEBEL.getClientInfo(session.userData.rut))
            }
        )

        const respuesta = await GENESYS.getClienteLlamadaSolicitar(info)

        var descripcion_basica = ""
        if (respuesta.response.Body.clienteLlamadaSolicitarExpResp.respMensaje.codigoMensaje == 1) {
            var descripcion_basica = "Cliente Solicitó CallBack"
            transaccionesQuiebres(session, {
                name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_FEEDBACK_NEGATIVO,
                request: { info },
                response: respuesta
            }, CODIGO.SUCCES)

        } else {
            var descripcion_basica = "Cliente solicita CallBack. CallBack Fallido"
            transaccionesQuiebres(session, {
                name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO_FEEDBACK_NEGATIVO,
                request: { info },
                response: respuesta
            }, CODIGO.ERROR_SERVICIO)
            logger.error(`/callback_feedback_negativo`)

        }

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
        session.userData.descripcion = "Fono = " + session.userData.telefono + " - RUT = " + session.userData.rut + " / " + descripcion_basica

        console.log("### FCR de CALLBACK ###")
        const resultCreateSS = await new Promise((resolve, reject) => {
            const info = SIEBEL.simpleFormatInfo(session.userData)
            resolve(SIEBEL.simpleCreatesSS(info))
        })

        session.send('Perfecto, un ejecutivo se contactará contigo en unos minutos más')
        session.endConversation()
    }
])