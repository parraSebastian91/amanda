require('./../../__services/genesys')
require('./../../functions/ingresoDatos/sectionPhone')
require('./../../functions/ingresoDatos/sectionRunFeedback')
const moment = require('moment')
const botReply = require('./text')
const { CODIGO, SERVICE } = require('./../../utils/control_errores')
const { transaccionesQuiebres } = require('../../utils')

bot.dialog('/solicitud_callback', [
    async(session, args, next) => {
        // Validamos si pasamos argumentos al dialogo con el valor descripcion_negocio
        if (args && args.descripcion_negocio) {
            session.dialogData.descripcion_negocio = args.descripcion_negocio
        } else {
            session.dialogData.descripcion_negocio = 'Falabella_SAC_CH'
        }

        let flagFlechaBloqueadaCallback = await GENESYS.validarBloqueoDiaCallback(session.dialogData.descripcion_negocio)
        if (!flagFlechaBloqueadaCallback) {
            if (moment().hours() >= 9 && moment().hours() < 21) {
                session.beginDialog('/sectionRunFeedback', 'is_solicitud_callback')
            } else {
                session.endConversation(botReply.text1)
            }
        } else {
            session.endConversation(botReply.text3)
        }
    },
    async(session, results, next) => {
        const info = {
            rut: session.userData.rut,
            phone: session.userData.telefono,
            nombreCtc: 'Amanda Atención Cliente',
            apellidoCtc: '',
            mailCh: ''
        }

        session.userData.currentClientInfo = await new Promise(
            (resolve, reject) => {
                resolve(SIEBEL.getClientInfo(session.userData.rut))
            }
        )

        if ((typeof session.userData.callback_backoffice != 'undefined' && session.userData.callback_backoffice == 1) || (typeof session.userData.ssCallback != 'undefined' && session.userData.ssCallback == 1))
            var respuesta = await GENESYS.getClienteLlamadaSolicitar(info, session.dialogData.descripcion_negocio)
        else
            var respuesta = await GENESYS.getClienteLlamadaSolicitar(info)

        var descripcion_basica = ""
        if (respuesta.response.Body.clienteLlamadaSolicitarExpResp.respMensaje.codigoMensaje == 1) {
            var descripcion_basica = "Cliente Solicitó CallBack"

            transaccionesQuiebres(session, {
                name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO,
                request: { info },
                response: respuesta
            }, CODIGO.SUCCES)

        } else {
            var descripcion_basica = "Cliente solicita CallBack. CallBack Fallido"

            transaccionesQuiebres(session, {
                name: SERVICE.CALLBACK_LLAMADO_CLIENTE_SOLICITADO,
                request: { info },
                response: respuesta
            }, CODIGO.ERROR_SERVICIO)
            logger.error(`/callback`)

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

        session.endConversation(botReply.text2)
    }
])