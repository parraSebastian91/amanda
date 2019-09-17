require('./atencion_comercial');
require('./devolucion_nota_credito');
require('./envio_mismo_producto');
require('./retiro_manual_producto_falla');
const intentLuis = require("../../../../../functions/salidaDinamica")

bot.dialog('/producto_con_falla', [
    (session, args, next) => {
        const menuOptions = `Atención Comercial|Devolución Nota de Crédito|Envío Mismo Producto|Retiro Manual Producto con Falla`
        const menuText = 'Entiendo, tu solicitud de servicio tiene relación con Producto con Falla ¿Cuál de las siguientes clasificaciones describe mejor tu solicitud?'
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 2
        })
    },
    async (session, results, next) => {
        if (!results.resumed) {
            switch (results.response.entity) {
                case 'Atención Comercial':
                    session.userData.nivel3 = 'Atención Comercial - PF'
                    session.beginDialog('/atencion_comercial')
                    break
                case 'Devolución Nota de Crédito':
                    session.userData.nivel3 = 'Devolución por NC - PF'
                    session.beginDialog('/devolucion_nota_credito')
                    break
                case 'Envío Mismo Producto':
                    session.userData.nivel3 = 'E/R mismo Producto - PF'
                    session.beginDialog('/envio_mismo_producto')
                    break
                case 'Retiro Manual Producto con Falla':
                    session.userData.nivel3 = 'Envío/Retiro Manual - PF'
                    session.beginDialog('/retiro_manual_producto_falla')
                    break
            }
        } else {
            // session.endConversation('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
            // session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
            let resultIntent = await intentLuis.dialogIntent(session)
            session.beginDialog(`/${resultIntent}`)
            return
        }
    },
])