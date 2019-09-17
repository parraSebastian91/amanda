require('./../../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda, transaccionesQuiebres } = require("../../../utils")
const { updSelectedOption } = require('../../../__services/quiebres/backoffice')
const { CODIGO, SERVICE } = require('../../../utils/control_errores')
const logger = require('../../../utils/logger')

function validaCallback(op) {
    let opCall = op.toLocaleLowerCase().trim()
    let opValid = ('Quiero hablar con un ejecutivo').toLocaleLowerCase().trim()

    return (opCall == opValid)
}
bot.dialog('/callback_quiebre', [
    async (session, args, next) => {
        if (args != undefined) {
            if ('session_userdata' in args) {
                session.userData = args.session_userdata
            }
        }
        if (!session.userData.dataPersonal.DatosQuiebre.usuarioVip) {
            const menuOptions = `Quiero hablar con un ejecutivo`
            const menuText = '$callback$ Si prefieres que te contactemos, preciona el botón "Quiero hablar con un ejecutuvo"'
            builder.Prompts.choice(session, menuText, menuOptions, {
                listStyle: builder.ListStyle.button,
                maxRetries: 1,
                retryPrompt: 'Estimado cliente, para poder ayudar a gestionar el inconveniente con el producto de tu orden de compra, te recomiendo que hables con uno de nuestros ejecutivos, por favor has click en el siguiente botón.'
            })
        } else { next() }
    },
    async (session, results, next) => {
        if (!session.userData.dataPersonal.DatosQuiebre.usuarioVip) {
            if (!results.resumed) {
                if (validaCallback(results.response.entity)) {
                    next()
                } else {
                    session.beginDialog('/end_conversation', { mensaje: 'Por favor, recuerda que debes presionar una opción válida.' })
                    // session.send('Por favor, recuerda que debes presionar una opción válida.')
                    // MensajeDeAyuda(session)
                    // session.endConversation()
                }
            } else {
                session.beginDialog('/end_conversation', { mensaje: 'Recuerda que si no ingresas la opción no podemos gestionar tu requerimiento.' })
                // session.send('Recuerda que si no ingresas la opción no podemos gestionar tu requerimiento.')
                // MensajeDeAyuda(session)
                // session.endConversation()
            }
        } else {
            next()
        }
    },
    async (session, args, next) => {
        try {
            const rut = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].customer_number_id_oc
            const telefono = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].customer_phone_oc
            const numeroSS = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].ss
            const numeroSKU = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.allBreakProducts[0].breakProducts[0].sku_break_product
            var respuesta = await CALLBACKQUIEBRE.getClienteCallbackQuiebre(rut, telefono, numeroSS)
            if (respuesta.codigoMensaje == '1') {
                transaccionesQuiebres(session, {
                    name: SERVICE.QUIEBRE_CALLBACK,
                    request: { rut, telefono, numeroSS },
                    response: respuesta
                }, CODIGO.SUCCES)
                const updateBO = await updSelectedOption(numeroSS, 'callback') // revisar codigo y dejar datos dinamicos para uso general de BO
                transaccionesQuiebres(session, {
                    name: SERVICE.SERVICIO_QUIEBRE_CALLBACK_BACKOFFICE,
                    request: { response: `"${numeroSS}, 'callback'"` },
                    response: updateBO
                }, CODIGO.SUCCES)
                let fono = telefono.substring(0, telefono.length - 4) + '****'
                let msg = `$$limpiarcookie $aceptocallback$ Entiendo, uno de nuestros ejecutivos te llamará a este número ${fono} lo antes posible`
                session.beginDialog('/end_conversation', { mensaje: msg })
                // session.endConversation()
                // MensajeDeAyuda(session)
                // session.endConversation()
                // agregar mensaje de ayuda al termino de callback exitoso
            } else {
                console.log(respuesta)
                transaccionesQuiebres(session, {
                    name: SERVICE.QUIEBRE_CALLBACK,
                    request: { rut, telefono, numeroSS },
                    response: respuesta
                }, CODIGO.ERROR_SERVICIO)
                logger.error("flujo BO: /callback_quiebre, line:71")
                session.beginDialog('/end_conversation')
                // session.endConversation()
            }
        } catch (error) {
            transaccionesQuiebres(session, {
                name: SERVICE.SERVICIO_QUIEBRE_CALLBACK_BACKOFFICE,
                request: session.userData,
                response: error
            }, CODIGO.ERROR_APLICACION)
            logger.error(`flujo BO: /callback_quiebre, ${error}`)
            session.beginDialog('/end_conversation')
            // session.endConversation()
        }
    }

])