
require('./devolucion_de_producto');
require('./incumplimiento_postventa');
require('./retiro_de_producto');
const intentLuis = require("../../../../../functions/salidaDinamica")

bot.dialog('/devolucion_de_compra', [
    (session, args, next) => {
        const menuOptions = `Devolución de Producto|Incumplimiento PostVenta|Retiro de Producto`
        const menuText = 'Entiendo, tu solicitud de servicio tiene relación con Devolución de Compra ¿Cuál de las siguientes clasificaciones describe mejor tu solicitud?'
        builder.Prompts.choice(session, menuText, menuOptions, { listStyle: builder.ListStyle.button, maxRetries: 2  })
    },
    async (session, results, next) => {
        if (!results.resumed) {
            switch (results.response.entity) {
                case 'Devolución de Producto':
                    // session.userData.nivel2 = 'Garantía Conect'
                    session.userData.nivel3 = 'Devolución por NC - DEV'
                    session.beginDialog('/devolucion_de_producto')
                    break
                case 'Incumplimiento PostVenta':
                    // session.userData.nivel2 = 'Garantía Extendida'
                    session.userData.nivel3 = 'Incpmto Políticas Devoluciones'
                    session.beginDialog('/incumplimiento_postventa')
                    break
                case 'Retiro de Producto':
                    // session.userData.nivel2 = 'Garantía Extendida'
                    session.userData.nivel3 = 'Retiro por Cambio de Producto'
                    session.beginDialog('/retiro_de_producto')
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