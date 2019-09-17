const { getSsDatoQuiebre } = require('./../../__services/quiebres/backoffice')
const { normalizarRut , transaccionesQuiebres} = require('./../../utils')
const botText = require('./../../bot_text/index')
const { CODIGO, SERVICE } = require('../../utils/control_errores')

const opcionGiftCard = function (opciones) {
    let gift = false
    opciones.forEach(op => {
        if (op.option_type == 'GiftCard') { gift = true }
    });
    return gift
}
const msjNoExisteSS = 'La Orden de compra enviada no existe en la base de datos'

module.exports = {
    async datosTokenQuiebre(session,tokenQuiebre) {
        const tknData = {
            'numeroOrden': null,
            'emailOrden': null,
            'usuarioVip': null,
            'ofrecerOpciones': '',
            'opcionGiftCard': false,
            'success': false,
            'mensaje': null,
            'infoQuiebre': null,
            'errorServicio': true

        }
        try {
            let ssInfoQuiere = await getSsDatoQuiebre(tokenQuiebre)
            transaccionesQuiebres(session, {
                name: SERVICE.DATOSTOKENQUIEBRE,
                request: tokenQuiebre,
                response: ssInfoQuiere
            }, CODIGO.SUCCES)
            if ('results' in ssInfoQuiere && (ssInfoQuiere.results == msjNoExisteSS || ssInfoQuiere.success == false)) {
                tknData.errorServicio = false
                tknData.mensaje = ssInfoQuiere.results
            } else if ('customer' in ssInfoQuiere) {
                tknData.numeroOrden = ssInfoQuiere.customer[0].purchase_order
                tknData.emailOrden = ssInfoQuiere.customer[0].customer_email_oc
                tknData.usuarioVip = (ssInfoQuiere.customer[0].customer_profile_oc == 'VIP') ? true : false
                tknData.ofrecerOpciones = ssInfoQuiere.customer[0].portal_status || ''
                tknData.opcionGiftCard = opcionGiftCard(ssInfoQuiere.allOptions[0].options)
                tknData.infoQuiebre = ssInfoQuiere
                tknData.errorServicio = false
                tknData.success = ssInfoQuiere.success
            }
            return tknData
        } catch (error) {
            tknData.mensaje = `${botText.initialGreeting}<br>${botText.msj_error_general}`
            transaccionesQuiebres(session, {
                name: SERVICE.DATOSTOKENQUIEBRE,
                request: tokenQuiebre,
                response: error.message
            }, CODIGO.ERROR_SERVICIO)
            return tknData

        }
    },
    validaFlujosQuiebre(userData) {
        const saludoRuta = {
            saludo: botText.initialGreeting,
            ruta: '/saludos'
        }
        let sessionActiva = userData.dataProgram.sessionActiva
        let ofrecerOpciones = (userData.dataPersonal.DatosQuiebre.ofrecerOpciones.toLowerCase().trim() == 'ofrecer opciones')
        let opQuiebreUnificado = (userData.dataPersonal.DatosQuiebre.ofrecerOpciones.toLowerCase().trim() == 'SS Unificada')
        let opcionGiftCard = userData.dataPersonal.DatosQuiebre.opcionGiftCard
        let rutBO = (userData.dataPersonal.DatosQuiebre.infoQuiebre != null) ? userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].customer_number_id_oc : null
        let rutValido = (normalizarRut(userData.dataPersonal.rutUsuario) == normalizarRut(rutBO))
        let success = userData.dataPersonal.DatosQuiebre.success
        let errorServicio = userData.dataPersonal.DatosQuiebre.errorServicio
        if (!success && errorServicio) {
            saludoRuta.saludo = `${botText.initialGreeting}<br>${botText.msj_error_general}`
        } else {
            if (!sessionActiva && ofrecerOpciones && opcionGiftCard && !opQuiebreUnificado) {
                saludoRuta.ruta = '/login_quiebre_backoffice'
            } else if (sessionActiva && ofrecerOpciones && opcionGiftCard && !opQuiebreUnificado) {
                if (rutValido) {
                    saludoRuta.ruta = '/quiebre_backoffice'
                    saludoRuta.saludo = botText.initialGreeting
                } else {
                    saludoRuta.saludo = "Estimado cliente, ha ocurrido un inconveniente al validar la información de tu sesión de Falabella.com, por favor ingresa nuevamente para dar solución a tu caso."
                }
            } else if (success && !ofrecerOpciones && !opQuiebreUnificado) {
                saludoRuta.ruta = '/quiebre_atendido'
                saludoRuta.saludo = botText.initialGreeting
            }
        }
        return saludoRuta
    }
}