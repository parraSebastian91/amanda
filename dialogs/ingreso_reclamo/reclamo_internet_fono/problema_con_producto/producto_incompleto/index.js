require('./devolucion_producto_incompleto')
require('./envio_producto_incompleto')
require('./retiro_manual_producto_incompleto')
const intentLuis = require("../../../../../functions/salidaDinamica")

bot.dialog('/problema_producto_incompleto', [
    (session, args, next) => {
        const menuOptions = `Devolución de Producto Incompleto|Envío de Producto Incompleto`
        const menuText = 'Entiendo, tu solicitud de servicio tiene relación con Producto Incompleto ¿Cuál de las siguientes clasificaciones describe mejor tu solicitud?'
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 2
        })
    },
    async (session, results, next) => {
        if (!results.resumed) {
            switch (results.response.entity) {
                case 'Devolución de Producto Incompleto':
                    session.userData.nivel3 = 'Envío/Retiro Manual - PI'
                    session.beginDialog('/devolucion_producto_incompleto')
                    break
                case 'Envío de Producto Incompleto':
                    session.userData.nivel3 = 'Envío/Retiro Manual - PI'
                    session.beginDialog('/envio_producto_incompleto')
                    break
                    /*case 'Retiro Manual de Producto Incompleto':
                        session.userData.nivel3 = 'Envío/Retiro Manual - PI'
                        session.beginDialog('/retiro_manual_producto_incompleto')
                        break*/
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