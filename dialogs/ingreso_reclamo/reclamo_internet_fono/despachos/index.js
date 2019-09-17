require('./cambio_fecha_entrega')
require('./producto_incompleto')
require('./despacho_atrasado')
require('./problema_transportista')
require('./producto_no_corresponde')
require('../problema_con_producto')
require('../../reclamo_generico')
const intentLuis = require("../../../../functions/salidaDinamica")
const botReply = require('./text')

bot.dialog('/despachos', [
    async(session, args, next) => {
        //let getOrder = await WEBTRACKING.getOrder(session)
        let menuOptions = ''
            // if (getOrder.success) {
            //   getOrder.state.sub_orders.forEach(function (e) {
            //     if (e.delivery_status.is_delivered == true) {
            //       menuOptions = `Despacho Atrasado|Producto Incompleto|Producto Dañado|Producto Equivocado|No he recibido el despacho|Problema con Transportista`
            //     } else {
            //       menuOptions = `Despacho Atrasado|Producto Incompleto|Producto Dañado|Producto Equivocado|Problema con Transportista`
            //     }
            //   })
            // } else {
            //   menuOptions = `Despacho Atrasado|Producto Incompleto|Producto Dañado|Producto Equivocado|Problema con Transportista`
            // }
            //menuOptions = `Despacho Atrasado|Producto Incompleto|Producto Dañado|Producto Equivocado|Problema con Transportista`
        menuOptions = ['Despacho Atrasado', 'Producto Dañado', 'Producto Incompleto', 'Producto Equivocado', 'Problema con Transportista']
            //const menuOptions = `Despacho Atrasado|Producto Incompleto|Producto Dañado|Producto Equivocado|No he recibido el despacho|Problema con Transportista`
            //const menuOptions = `Cambio Fecha Entrega|Producto Incompleto|Despacho Atrasado|Problema con Transportista`
        const menuText = '$Despacho$ Lamento que hayas tenido un inconveniente con tu despacho ¿Me podrías indicar qué situación en específico ocurrió?'
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 0
        })
    },
    async(session, results, next) => {
        if (!results.resumed) {
            //session.userData.requirePayMethod = true;
            switch (results.response.entity) {
                /*
                case 'Cambio Fecha Entrega':
                  session.userData.nivel2 = 'Cambio Fecha de entrega'
                  session.userData.nivel3 = 'Cambio Fecha de entrega'
                  session.beginDialog('/cambio_fecha_entrega')
                  break
                */
                case 'Despacho Atrasado':

                    session.userData.nivel1 = 'Despachos'
                    session.userData.nivel2 = 'Incumplimiento de fecha'
                    session.userData.nivel3 = 'Incumplimiento fecha Entrega'
                    session.beginDialog('/reclamo_generico')
                        /** SAC-1510 Mejorar creación SS con Problemas en Despacho, se cambian Niveles*/
                        // session.userData.nivel2 = 'Incumplimiento de fecha'
                        // session.userData.nivel3 = 'Incumplimiento fecha Entrega'
                        // session.beginDialog('/reclamo_generico')
                        /*** 25/06/2018 a solicitud de Natalia Osses se esconde tipología nivel 3 ***/
                        //session.userData.nivel3 = 'Incumplimiento Sin Stock'
                        //session.beginDialog('/despacho_atrasado')
                    break
                case 'Producto Incompleto':
                    session.userData.nivel1 = 'Gestión sobre el producto'
                    session.userData.nivel2 = 'Producto incompleto'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PI'
                    session.beginDialog('/reclamo_generico')
                    break
                case 'Producto Dañado':
                    session.userData.nivel1 = 'Gestión sobre el producto'
                    session.userData.nivel2 = 'Producto con daño estético'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PD'
                    session.beginDialog('/reclamo_generico')
                    break
                case 'Producto Equivocado':
                    session.userData.nivel1 = 'Despachos'
                    session.userData.nivel2 = 'Prod entregado no corresponde'
                    session.userData.nivel3 = 'Envío/Retiro Manual - PNC'
                    session.beginDialog('/reclamo_generico')
                    break
                    /** SAC-1510 Mejorar creación SS con Problemas en Despacho, Se elimina opcion 'No he recibido el despacho'*/
                    // case 'No he recibido el despacho':
                    //   session.userData.nivel2 = 'Incumplimiento de fecha'
                    //   session.userData.nivel3 = 'Incumplimiento fecha Entrega'
                    //   session.userData.flagTotalEntregaFalso = true
                    //   session.beginDialog('/reclamo_generico')
                    //   break
                case 'Problema con Transportista':
                    session.userData.nivel1 = 'Despachos' /** SAC-1510 Mejorar creación SS con Problemas en Despacho, Se agrega Nivel1'*/
                    session.userData.nivel2 = 'Problema con el Transportista'
                    session.userData.nivel3 = 'Problema con el Transportista'
                    session.beginDialog('/problema_transportista')
                    break
                    /*
                    case 'Producto no Corresponde':
                      session.userData.nivel2 = 'Prod entregado no corresponde'
                      session.userData.nivel3 = 'Envío/Retiro Manual - PNC'
                      session.beginDialog('/producto_no_corresponde')
                      break
                    case 'Problema con Producto':
                      session.userData.nivel1 = 'Gestión sobre el producto'
                      session.beginDialog('/problema_con_producto')
                      break
                    */
            }
        } else {
            // session.userData.sectionSalida = '/despachos'
            // session.beginDialog('/salida')
            let resultIntent = await intentLuis.dialogIntent(session)
            session.beginDialog(`/${resultIntent}`)
            return
        }
    }
])