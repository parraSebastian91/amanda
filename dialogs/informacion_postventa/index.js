const intentLuis = require("../../functions/salidaDinamica")

bot.dialog('/informacion_postventa', [
    (session, args, next) => {
        const menuOptions = `Problemas con Productos|Anulación de Compra|Cambio Boleta a Factura|Ingreso Solicitud|Consulta Solicitud`
        const menuText = '$ingreso_Serv_postventa$ ¿Qué información necesitas de nuestros Servicios de PostVenta?'
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 0
        })
    },
    async(session, results, next) => {
        if (!results.resumed) {
            switch (results.response.entity) {
                case 'Problemas con Productos':
                    session.beginDialog('/problemas_productos')
                    break
                case 'Anulación de Compra':
                    session.beginDialog('/anulacion_orden_compra')
                    break
                case 'Cambio Boleta a Factura':
                    session.beginDialog('/cambio_boleta_factura')
                    break
                case 'Ingreso Solicitud':
                    session.beginDialog('/ingreso_reclamo')
                    break
                case 'Consulta Solicitud':
                    session.beginDialog('/consulta_reclamo')
                    break
            }
        } else {
            // session.userData.sectionSalida = '/servicio_postventa'
            // session.beginDialog('/salida')
            let resultIntent = await intentLuis.dialogIntent(session)
            session.beginDialog(`/${resultIntent}`)
            return
        }
        //else {
        //console.log('---------ELSE----------')
        //session.endConversation('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
        //session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
        //}
    }
])