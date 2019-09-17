const { transaccionesQuiebres } = require('../../../utils')
const logger = require('../../../utils/logger')
bot.dialog('/login_quiebre_backoffice', [
    async (session, args, next) => {
        if ('session_userdata' in args) {
            session.userData = args.session_userdata
            session.userData.orderNumber = session.userData.dataPersonal.DatosQuiebre.numeroOrden
            session.userData.orden_compra = session.userData.dataPersonal.DatosQuiebre.numeroOrden
            session.userData.rut = session.userData.dataPersonal.DatosQuiebre.infoQuiebre.customer[0].customer_number_id_oc
            session.userData.email = session.userData.dataPersonal.DatosQuiebre.emailOrden
            session.userData.statusVIP = session.userData.dataPersonal.DatosQuiebre.usuarioVip
        } else {
            transaccionesQuiebres(session, null, CODIGO.ERROR_APLICACION_SESSION_EMPTY)
            logger.error('Error controlado: /quiebre_backoffice')
            session.beginDialog('/saludos')
        }
        const logx = '$GIFTCARD$Para seguir gestionando tu caso necesito que inicies sesion en el siguiente [LINK](https://secure.falabella.com/falabella-cl/myaccount/includes/loginForm.jsp?successUrl=/)'
        builder.Prompts.text(session, logx);
    },
    async (session, results, next) => {
        const logx = '$GIFTCARD$Estimado cliente, para poder ayudar a gestionar el inconveniente con el producto de tu orden de compra, necesito que inicies sesión en el siguiente [LINK](https://secure.falabella.com/falabella-cl/myaccount/includes/loginForm.jsp?successUrl=/. Esto es para resguardar la información de tu orden de compra)'
        builder.Prompts.text(session, logx);
    },
    async (session, results, next) => {
        const intentType = await new Promise(async resolve => {
            resolve(await connectionApiLuis.existsInLUIS(results.response))
        })
        var cobro_tarjeta_externa = 'n3_error_cobro_tarjeta_externa';
        var cobro_tarjeta_cmr = 'n3_error_cobro_tarjeta_cmr';
        if (
            cobro_tarjeta_externa === intentType.toLowerCase() ||
            cobro_tarjeta_cmr === intentType.toLowerCase()
        ) {
            session.beginDialog('/none');
        } else {
            session.beginDialog(`/${ intentType.toLowerCase() }`);
        }
    }

])
