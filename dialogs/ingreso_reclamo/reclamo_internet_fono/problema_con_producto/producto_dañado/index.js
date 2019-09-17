require('./devolucion_producto_dañado')
require('./retiro_producto_dañado')
require('./envio_manual_producto')
const intentLuis = require("../../../../../functions/salidaDinamica")

bot.dialog('/producto_dañado', [
    (session, args, next) => {
        const menuOptions = `Devolución de Producto Dañado|Retiro de Producto Dañado|Retiro Manual de Producto`
        const menuText = 'Entiendo, tu solicitud de servicio tiene relación con Producto Dañado ¿Cuál de las siguientes clasificaciones describe mejor tu solicitud?'
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 2
        })
    },
    async (session, results, next) => {
        if (!results.resumed) {
            switch (results.response.entity) {
                case 'Devolución de Producto Dañado':
                    session.userData.nivel3 = 'Devolución por NC - PD'
                    session.beginDialog('/devolucion_producto_dañado')
                    break
                case 'Retiro de Producto Dañado':
                    session.userData.nivel3 = 'E/R mismo Producto - PD'
                    session.beginDialog('/retiro_producto_dañado')
                    break
                case 'Retiro Manual de Producto':
                    session.userData.nivel3 = 'Envío/Retiro Manual - PD'
                    session.beginDialog('/envio_manual_producto')
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