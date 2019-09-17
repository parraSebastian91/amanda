require('dotenv').config()
require('events').EventEmitter.prototype._maxListeners = 0
const { datosTokenQuiebre, validaFlujosQuiebre } = require('./functions/quiebre/validaQuiebre')
const restify = require('restify')
// const request = require('request')
const validarFechaSessionActiva = require('./functions/validaciones/fecha').validarFechaSessionActiva
const { validaUsuarioLogeado } = require('./utils')

global.builder = require('botbuilder')
global._ = require('lodash')
global.GENESYS = require('./__services/genesys')
global.CALLBACKQUIEBRE = require('./__services/quiebres/callback')
global.SIEBEL = require('./__services/siebel')
global.WEBTRACKING = require('./__services/webtracking')
global.SENTIMENT = require('./__services/analyzeSentiment')
global.OMS = require('./__services/oms')
global.CONTROLLER = require('./controller')
global.botText = require('./bot_text') // Variable para mensajes
global.connectionApiLuis = require('./connectionApiLuis.js')
global.ATG = require('./__services/atg')
global.ENRUTA = require('./__services/enRuta')
global.MENSAJES = require('./__services/mensajes')
global.LiveChat = {}

global.StockServiceConf = {
        total: 0,
        time: '',
        freq: 2
    }
    // const servicio_instalacion = require('./dialogs/servicio_instalacion')
    // const servicio_reciclaje = require('./dialogs/servicio_reciclaje')
    // require('./__tests')() // Realizar pruebas
    // .
appInsights = require('applicationinsights')
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(false)
    .start()

const insigth = require('./functions/insigth')

const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
})

const server = restify.createServer()
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url)
})

server.on('uncaughtException', function(req, res, route, err) {
    insigth.save(req, res, route, err)
})

const inMemoryStorage = new builder.MemoryBotStorage()

const validaLogin = function(session) {
    if (!validarFechaSessionActiva(session.userData)) {
        return validaUsuarioLogeado(session)
    }
}

global.bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage)
    /*
        Logs to conversation save
     */
global.logs = require('./logs')
require('./logs/middleware.js')(bot)

server.post('/api/messages', connector.listen())
server.post('/livechat', (req, res, next) => {
    bot.loadSession(LiveChat[res.req.body.id].messageAddress, async (e, session) => {
        session.send(res.req.body.mensaje)
    })
})

bot.use({
        botbuilder: (session, next) => {
            session.sendTyping()
            next()
        }
    })
    /*
     * Condicional para la ejecución del saludo de Amanda
     * En ambiente productivo el saludo es gatillado desde el Webchat y
     * desde dev o test se gatilla automáticamente
     */
    // prueba
    // inicio flujo de prueba para quiebre
    // flujo de prueba para quiebres
if (process.env.ENVIRONMENT === 'production') {
    bot.on('event', (message) => {
        bot.loadSession(message.address, async(e, session) => {
            let initial_greeting = botText.initialGreeting
            let ruta = '/saludos'
                //  session.userData.cc = usuarioQuiebre
            if (typeof session.userData.dataPersonal === 'undefined' && typeof session.userData.dataProgram === 'undefined') {
                session.userData.dataPersonal = {
                    'nombreUsuario': '',
                    'emailUsuario': '',
                    'rutUsuario': '',
                    'sessionId': '',
                    'tokenQuiebre': '',
                    'DatosQuiebre': ''
                }
                session.userData.dataProgram = {
                    'sessionActiva': false,
                    'sessionInicial': '',
                    'sessionExpira': '',
                    'palabraCorta': false,
                    'contadorSaludoDinamico': 3,
                    'ServiceOn': false
                }
            }
            session.userData.dataPersonal.sessionId = message.value.sessionId
                // set de variable session token quiebre BO
            session.userData.dataPersonal.tokenQuiebre = message.value.tokenQuiebre
                // validación en variable de entorno para apagar total el flujo de Quiebres BO process.env.QUIEBRE_ON
            console.log('----------tknQbr-----------')
            console.log(session.userData.dataPersonal.tokenQuiebre)

            if (process.env.QUIEBRE_ON === 'true' && session.userData.dataPersonal.tokenQuiebre !== '' && session.userData.dataPersonal.tokenQuiebre !== undefined) {
                const dataLogin = await validaLogin(session)
                let usuarioQuiebre = await datosTokenQuiebre(session, session.userData.dataPersonal.tokenQuiebre)
                    // ********************************  seteo de datos usuario
                session.userData.dataPersonal.emailUsuario = dataLogin.dataPersonal.emailUsuario
                session.userData.dataPersonal.rutUsuario = dataLogin.dataPersonal.rutUsuario
                session.userData.dataProgram.sessionInicial = dataLogin.dataProgram.sessionInicial
                session.userData.dataProgram.sessionExpira = dataLogin.dataProgram.sessionExpira
                session.userData.dataProgram.sessionActiva = dataLogin.dataProgram.sessionActiva
                session.userData.dataPersonal.DatosQuiebre = usuarioQuiebre
                    // **************************************************************
                    // * ***********************************************************/
                    // inicio de validación flujo quiebre BO
                const flujos = validaFlujosQuiebre(session.userData)

                ruta = flujos.ruta
                initial_greeting = flujos.saludo
            }
            if (message.name === 'iniciarSaludo') {
                session.userData.dataPersonal.nombreUsuario = message.user.name
                session.userData.dataPersonal.sessionId = message.value.sessionId
                if (session.userData.dataPersonal.nombreUsuario === 'undefined' || session.userData.dataPersonal.nombreUsuario === 'Yo') {
                    session.userData.dataPersonal.nombreUsuario = 'Hola, '
                } else {
                    session.userData.dataPersonal.nombreUsuario = `Hola ${ session.userData.dataPersonal.nombreUsuario }, `
                }

                if (message.value === '' || message.value !== 'saludo_resumido') {
                    initial_greeting = initial_greeting.replace('{NOMBRE_USUARIO}', session.userData.dataPersonal.nombreUsuario)

                    bot.send(new builder.Message()
                        .address(message.address)
                        .text(initial_greeting)
                    )
                    bot.beginDialog(message.address, ruta, { flag_no_mostrar_saludo: true, flag_aumentar_contador: true, session_userdata: session.userData })
                } else {
                    bot.beginDialog(message.address, ruta, { flag_no_mostrar_saludo: true, flag_aumentar_contador: false, session_userdata: session.userData })
                }
            } else if (message.name === 'enviarIdSesion') {
                session.userData.dataPersonal.sessionId = message.value.sessionId
            }
        })
    })
} else {
    bot.on('conversationUpdate', (message) => {
        // if (message.membersAdded[0].name != 'Bot') {
        //     global.Interrup = {
        //         messageAddress: message.address
        //     }
        // }
        bot.loadSession(message.address, async(e, session) => {
            let initial_greeting = botText.initialGreeting
            let ruta = '/saludos'
            session.userData.dataPersonal = {
                'nombreUsuario': '',
                'emailUsuario': '',
                'rutUsuario': '',
                'sessionId': '',
                'tokenQuiebre': '',
                'DatosQuiebre': ''
            }
            session.userData.dataProgram = {
                    'sessionActiva': false,
                    'sessionInicial': '',
                    'sessionExpira': '',
                    'palabraCorta': false,
                    'contadorSaludoDinamico': 3,
                    'rutNoValidoEnOrdenCompra': false,
                    'ServiceOn': false
                }
                // validación en variable de entorno para apagar total el flujo de Quiebres BO process.env.QUIEBRE_ON
            if (process.env.QUIEBRE_ON === 'true' && session.userData.dataPersonal.tokenQuiebre !== '' && session.userData.dataPersonal.tokenQuiebre !== undefined) {
                const dataLogin = await validaLogin(session)
                let usuarioQuiebre = await datosTokenQuiebre(session, session.userData.dataPersonal.tokenQuiebre)
                    // ********************************  seteo de datos usuario
                session.userData.dataPersonal.emailUsuario = dataLogin.dataPersonal.emailUsuario
                session.userData.dataPersonal.rutUsuario = dataLogin.dataPersonal.rutUsuario
                session.userData.dataProgram.sessionInicial = dataLogin.dataProgram.sessionInicial
                session.userData.dataProgram.sessionExpira = dataLogin.dataProgram.sessionExpira
                session.userData.dataProgram.sessionActiva = dataLogin.dataProgram.sessionActiva
                session.userData.dataPersonal.DatosQuiebre = usuarioQuiebre
                    // **************************************************************
                    // ************************************************************/
                    // inicio de validación flujo quiebre BO
                const flujos = validaFlujosQuiebre(session.userData)
                ruta = flujos.ruta
                initial_greeting = flujos.saludo
            }
            // ************************************************************/
            // inicio de validación flujo quiebre B
            if (message.membersAdded) {
                message.membersAdded.forEach(identity => {
                    if (identity.id === message.address.bot.id) {
                        session.userData.dataPersonal.nombreUsuario += ' '
                        initial_greeting = initial_greeting.replace('{NOMBRE_USUARIO}', session.userData.dataPersonal.nombreUsuario)
                        bot.send(new builder.Message()
                            .address(message.address)
                            .text(initial_greeting)
                        )
                        bot.beginDialog(message.address, ruta, { flag_no_mostrar_saludo: true, flag_aumentar_contador: true, session_userdata: session.userData })
                    }
                })
            }
        })
    })
}

const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

let intents = new builder.IntentDialog({
        recognizers: [recognizer]
    })
    
    // Se realiza 'match' con intents de LUIS (Amanda)

bot.dialog('/', intents)
    // .matches('Actualizacion_datos_cmr', '/actualizacion_datos_cmr')
    .matches('Actualizacion_datos_cmr', '/actualizacion_datos_cmr')
    .matches('Anulacion_orden_compra', '/anulacion_orden_compra')
    .matches('Anulacion_pendiente', '/anulacion_pendiente')
    .matches('Armado_producto', '/armado_producto')
    .matches('Beneficios_club_bebe', '/beneficios_club_bebe')
    .matches('Bloqueo_tarjeta_cmr', '/bloqueo_tarjeta_cmr')
    .matches('CHIT_CHAT_amistad', '/chit_chat_amistad')
    .matches('CHIT_CHAT_ayuda', '/chit_chat_ayuda')
    .matches('CHIT_CHAT_casate_conmigo', '/chit_chat_casate_conmigo')
    .matches('CHIT_CHAT_chistes', '/chit_chat_chistes')
    .matches('CHIT_CHAT_clima', '/chit_chat_clima')
    .matches('CHIT_CHAT_como_te_llamas', '/chit_chat_como_te_llamas')
    .matches('CHIT_CHAT_de_donde_eres', '/chit_chat_de_donde_eres')
    .matches('CHIT_CHAT_despedida', '/chit_chat_despedida')
    .matches('CHIT_CHAT_donde_trabajas', '/chit_chat_donde_trabajas')
    .matches('CHIT_CHAT_eres_real', '/chit_chat_eres_real')
    .matches('CHIT_CHAT_estado', '/chit_chat_estado')
    .matches('CHIT_CHAT_estado_civil', '/chit_chat_estado_civil')
    .matches('CHIT_CHAT_estado_familiar_agente', '/chit_chat_estado_familiar_agente')
    .matches('CHIT_CHAT_fecha_actual', '/chit_chat_fecha_actual')
    .matches('CHIT_CHAT_fecha_cumpleanos', '/chit_chat_fecha_cumpleanos')
    .matches('CHIT_CHAT_gracias', '/chit_chat_gracias')
    .matches('CHIT_CHAT_gusto_futbol', '/chit_chat_gusto_futbol')
    .matches('CHIT_CHAT_hora_actual', '/chit_chat_hora_actual')
    .matches('CHIT_CHAT_horario_trabajo_agente', '/chit_chat_horario_trabajo_agente')
    .matches('CHIT_CHAT_que_edad_tienes', '/chit_chat_que_edad_tienes')
    .matches('CHIT_CHAT_que_haces', '/chit_chat_que_haces')
    .matches('CHIT_CHAT_salario_de_agente', '/chit_chat_salario_de_agente')
    .matches('CHIT_CHAT_saludo', '/chit_chat_saludo')
    .matches('CHIT_CHAT_te_gustaria_ser_humano', '/chit_chat_te_gustaria_ser_humano')
    .matches('CHIT_CHAT_tienes_hambre', '/chit_chat_tienes_hambre')
    .matches('CHIT_CHAT_usuario_aburrido', '/chit_chat_usuario_aburrido')
    .matches('CHIT_CHAT_usuario_cansado', '/chit_chat_usuario_cansado')
    .matches('CHIT_CHAT_usuario_contento', '/chit_chat_usuario_contento')
    .matches('CHIT_CHAT_usuario_enojado', '/chit_chat_usuario_enojado')
    .matches('CHIT_CHAT_usuario_suicida', '/chit_chat_usuario_suicida')
    .matches('CHIT_CHAT_usuario_tiene_sueno', '/chit_chat_usuario_tiene_sueno')
    .matches('CHIT_CHAT_usuario_triste', '/chit_chat_usuario_triste')
    .matches('Callback_no_realizado', '/callback_no_realizado')
    .matches('Cambio_boleta_factura', '/cambio_boleta_factura')
    // .matches('Cambio_direccion_despacho', '/cambio_direccion_despacho')
    .matches('Cambio_fecha_despacho', '/cambio_fecha_despacho')
    .matches('Clave_cmr', '/clave_cmr')
    .matches('Como_eliminar_producto', '/como_eliminar_producto')
    .matches('Como_obtener_sku', '/como_obtener_sku')
    .matches('Comparar_productos', '/comparar_productos')
    .matches('Compra_garantia_extendida', '/compra_garantia_extendida')
    .matches('Compra_y_retira_diferentes_tiendas', '/compra_y_retira_diferentes_tiendas')
    .matches('Consulta_extranjero', '/consulta_extranjero')
    .matches('Consulta_extranjero_despacho', '/consulta_extranjero_despacho')
    .matches('Consulta_reclamo', '/consulta_reclamo')
    .matches('Consulta_stock', '/consulta_stock')
    // .matches('Consultas_y_dudas', '/consultas_y_dudas') no se utiliza debido a modificacion menu
    .matches('Contacto_garantia_extendida', '/contacto_garantia_extendida')
    .matches('Contacto_servicio_al_cliente', '/contacto_servicio_al_cliente')
    .matches('Contacto_servicio_tecnico', '/contacto_servicio_tecnico')
    // Nuevo Flujo
    .matches('Copia_boleta', '/copia_boleta')
    .matches('Correo_confirmacion_no_recibido', '/correo_confirmacion_no_recibido')
    .matches('Costo_despacho', '/costo_despacho')
    .matches('Definicion_club_deco', '/definicion_club_deco')
    .matches('Descripcion_garantia_extendida', '/descripcion_garantia_extendida')
    .matches('Estado_servicio_tecnico', '/estado_servicio_tecnico')
    .matches('Explicacion_procedimiento_compra', '/explicacion_procedimiento_compra')
    .matches('Generico_clave', '/generico_clave')
    .matches('Generico_otros_negocios', '/generico_otros_negocios')
    .matches('Gerente_tienda', '/gerente_tienda')
    .matches('Getsurvey', '/getsurvey')
    .matches('Horario_despacho', '/horario_despacho')
    .matches('Horario_tienda', '/horario_tienda')
    .matches('Horario_tienda_padre', '/horario_tienda_padre')
    // .matches('Incumplimiento_reclamo', '/incumplimiento_reclamo')
    .matches('Informacion_banco_falabella', '/informacion_banco_falabella')
    .matches('Informacion_club_bebe', '/informacion_club_bebe')
    .matches('Informacion_club_deco', '/informacion_club_deco')
    .matches('Informacion_club_novios', '/informacion_club_novios')
    .matches('Informacion_gift_card', '/informacion_gift_card')
    .matches('Informacion_orden_compra', '/informacion_orden_compra')
    .matches('Informacion_postventa', '/informacion_postventa')
    .matches('Informacion_retiro_tienda', '/informacion_retiro_tienda')
    .matches('Informacion_seguros_falabella', '/informacion_seguros_falabella')
    .matches('Informacion_tarjeta_cmr', '/informacion_tarjeta_cmr')
    .matches('Informacion_ventas', '/informacion_ventas')
    .matches('Informacion_viajes_falabella', '/informacion_viajes_falabella')
    .matches('Ingreso_reclamo', '/ingreso_reclamo')
    .matches('Instalacion_domicilio_costo', '/instalacion_domicilio_costo')
    .matches('Instalacion_domicilio_productos', '/instalacion_domicilio_productos')
    .matches('Instalacion_domicilio_plazo', '/instalacion_domicilio_plazo')
    .matches('Instalacion_domicilio_cobertura', '/instalacion_domicilio_cobertura')
    .matches('Jefe_tienda', '/jefe_tienda')
    .matches('Lugares_para_despacho', '/lugares_para_despacho')
    .matches('Modificacion_datos_orden_compra', '/modificacion_datos_orden_compra')
    .matches('N3_devolucion_no_acredita_tc', '/n3_devolucion_no_acredita_tc')
    .matches('N3_envio_mismo_sku', '/n3_envio_mismo_sku')
    //   .matches('N3_error_cobro_tarjeta_cmr', '/n3_error_cobro_tarjeta_cmr')
    //   .matches('N3_error_cobro_tarjeta_externa', '/n3_error_cobro_tarjeta_externa')
    .matches('N3_incumplimiento_fecha', '/n3_incumplimiento_fecha')
    .matches('N3_problema_con_usuario_web_clave', '/n3_problema_con_usuario_web_clave')
    .matches('N3_problema_transportista', '/n3_problema_transportista')
    .matches('N3_publicidad_enganosa', '/n3_publicidad_enganosa')
    .matches('No_me_sirve', '/no_me_sirve')
    .matches('Opciones_medio_pago', '/opciones_medio_pago')
    .matches('Pagina_web_cmr', '/pagina_web_cmr')
    .matches('Pagina_web_falabella', '/pagina_web_falabella')
    .matches('Problema_pagina_web', '/problema_pagina_web')
    .matches('Periodo_vigencia_garantia', '/periodo_vigencia_garantia')
    .matches('Plazo_retiro_tienda', '/plazo_retiro_tienda')
    .matches('Plazos_club_deco', '/plazos_club_deco')
    .matches('Politicas_postventa', '/politicas_postventa')
    .matches('Preguntas_frecuentes_cupon_descuento', '/preguntas_frecuentes_cupon_descuento')
    .matches('Preguntas_frecuentes_empresa_venta', '/preguntas_frecuentes_empresa_venta')
    .matches('Preguntas_frecuentes_homy', '/preguntas_frecuentes_homy')
    .matches('Preguntas_frecuentes_sodimac', '/preguntas_frecuentes_sodimac')
    .matches('Preguntas_frecuentes_tottus', '/preguntas_frecuentes_tottus')
    .matches('Problemas_compra', '/problemas_compra')
    .matches('Producto_descompuesto', '/producto_descompuesto')
    .matches('Productos_club_bebe', '/productos_club_bebe')
    .matches('Productos_ordenes_compra', '/productos_ordenes_compra')
    .matches('Puntos_club_bebe', '/puntos_club_bebe')
    .matches('Puntos_club_deco', '/puntos_club_deco')
    .matches('Puntos_cmr', '/puntos_cmr')
    .matches('Puntos_compras_club_deco', '/puntos_compras_club_deco')
    .matches('Queja_mal_servicio', '/queja_mal_servicio')
    .matches('Quiero_buscar_producto', '/quiero_buscar_producto')
    .matches('Quiero_comprar_producto', '/quiero_comprar_producto')
    .matches('Reciclaje_domicilio_costo', '/reciclaje_domicilio_costo')
    .matches('Reciclaje_domicilio_productos', '/reciclaje_domicilio_productos')
    .matches('Reciclaje_domicilio_empresas', '/reciclaje_domicilio_empresas')
    .matches('Reciclaje_domicilio_cobertura', '/reciclaje_domicilio_cobertura')
    .matches('Registro_web_falabella', '/registro_web_falabella')
    .matches('Requisitos_retiro_tienda', '/requisitos_retiro_tienda')
    // .matches('Retiro_tienda_no_puedo_retirar', '/retiro_tienda_no_puedo_retirar')
    .matches('Retiro_fuera_plazo_tienda', '/retiro_fuera_plazo_tienda')
    .matches('Sernac_reclamo', '/sernac_reclamo')
    .matches('Sin_respuesta_garantia_extendida', '/sin_respuesta_garantia_extendida')
    .matches('Solicitud_callback', '/solicitud_callback')
    .matches('Tengo_una_pregunta', '/tengo_una_pregunta')
    .matches('Terminar_contrato_cmr', '/terminar_contrato_cmr')
    .matches('Tienda_inexistente', '/tienda_inexistente')
    .matches('Tiendas_club_bebe', '/tiendas_club_bebe')
    .matches('Ubicacion_tienda', '/ubicacion_tienda')
    .matches('Venta_telefonica', '/venta_telefonica')
    // Ofertas dia de la madre
    .matches('Dia_de_la_Madre', '/dia_de_la_madre')
    // Navidad
    .matches('Catalogo_navidad', '/catalogo_navidad')
    // flujo Nota credito
    .matches('Informacion_nota_credito', '/informacion_nota_credito')

.onDefault('/none')

require('./functions')()
require('./dialogs')()

global.validatePromptsText = (messageError, session, maxRetries) => {
    if (typeof session.userData.retryDialog === 'undefined') {
        session.userData.retryDialog = 0
    }
    if (session.userData.retryDialog >= maxRetries) {
        delete session.userData.retryDialog
        session.endConversation(messageError)
        return false
    }
    return true
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
        // application specific logging, throwing an error, or other logic here
})

// bot.library(servicio_instalacion.createLibrary());
// bot.library(servicio_reciclaje.createLibrary());