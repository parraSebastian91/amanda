require('./anulacion_compra')
require('./../../reclamo_generico')
require('./desconoce_compra')
require('./errores_en_cobros')
require('../../../anulacion_orden_compra')
const intentLuis = require("../../../../functions/salidaDinamica")
const botReply = require('./text')

bot.dialog('/boletas_y_cobros', [
    (session, args, next) => {
        const menuOptions = `Atraso en Factura|Desconoce Compra`
        //const menuOptions = `Atraso en Factura|Desconoce Compra|Reembolso Pendiente|Errores en Cobros`--06/06/2019-se elimina error en cobro por definicion del negocio 
        //const menuOptions = `Anulación Compra Parcial|Anulación Compra Total|Atraso en Factura|Desconoce Compra|Reembolso Pendiente|Errores en Cobros`
        const menuText = botReply.text1
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 0
        })
    },
    async (session, results, next) => {
        if (!results.resumed) {
            //session.userData.requirePayMethod = true;
            switch (results.response.entity) {
                // case 'Anulación de Compra':
                //     session.beginDialog('/anulacion_compra')
                //     //session.beginDialog('/anulacion_orden_compra')
                //     break
                case 'Atraso en Factura':
                    session.userData.nivel2 = 'Atraso de emisión de factura'
                    session.userData.nivel3 = 'Atraso de emisión de factura'
                    session.beginDialog('/reclamo_generico')
                    break
                case 'Desconoce Compra':
                    session.userData.nivel2 = 'Desconocimiento de Compra'
                    session.beginDialog('/desconoce_compra')
                    break
                // case 'Reembolso Pendiente':
                //     session.userData.nivel2 = 'Devolucion no acreditada en TC'
                //     session.userData.nivel3 = 'Devolucion no acreditada en TC'
                //     session.beginDialog('/reclamo_generico')
                //     break
                //  --06/06/2019-- se comenta funcionalidad por validacion y requerimiento de negocio 06/06/2019
                //     case 'Errores en Cobros':
                //     session.userData.nivel2 = 'Errores en cobro'
                //     session.beginDialog('/errores_en_cobros')
                //     break
            }
        } else {
            // session.endConversation('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
            // session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
            let resultIntent = await intentLuis.dialogIntent(session)
            session.beginDialog(`/${resultIntent}`)
            return
        }
    }
])