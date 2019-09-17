require('./devolucion_de_compra')
require('./producto_dañado')
require('./producto_con_falla')
require('./producto_incompleto')
const botReply = require('./text')
const intentLuis = require("../../../../functions/salidaDinamica")


bot.dialog('/problema_con_producto', [
    (session, args, next) => {
        const menuOptions = `Devolución de compra|Producto Dañado|Producto con Falla|Producto Incompleto`
        const menuText = 'Entiendo, tu solicitud de servicio tiene relación con Problema con Producto ¿Cuál de las siguientes clasificaciones describe mejor tu solicitud?'
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 2
        })
    },
    async (session, results, next) => {
        if (!results.resumed) {
            switch (results.response.entity) {
                case 'Devolución de compra':
                    session.userData.nivel2 = 'Devolución/Cambio de Compra'
                    session.beginDialog('/devolucion_de_compra')
                    break
                case 'Producto Dañado':
                    session.userData.nivel2 = 'Producto con daño estético'
                    session.beginDialog('/producto_dañado')
                    break
                case 'Producto con Falla':
                    session.userData.nivel2 = 'Producto con falla de functo'
                    session.beginDialog('/producto_con_falla')
                    break
                case 'Producto Incompleto':
                    session.userData.nivel2 = 'Producto incompleto'
                    session.beginDialog('/problema_producto_incompleto')
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