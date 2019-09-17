const textoSaludoDinamico = require('./textoSaludoDinamico.json');
const validarFechaSessionActiva = require('./../../functions/validaciones/fecha')
    .validarFechaSessionActiva;
const login = require('./../../functions/login').login;

bot.dialog('/saludos', [
    async (session, args, next) => {
        if (!args.flag_no_mostrar_saludo &&
            args.flag_aumentar_contador &&
            args.session_userdata !== false
        ) {
            textoSaludoDinamico.forEach(function (element) {
                if (
                    element.intento ===
                    session.userData.dataProgram.contadorSaludoDinamico % 3
                ) {
                    saludoDinamico = element.saludotext;
                }
            });
            session.userData = args.session_userdata;
            session.userData.dataProgram.contadorSaludoDinamico =
                session.userData.dataProgram.contadorSaludoDinamico + 1;
            session.send(
                saludoDinamico.replace(
                    '{NOMBRE_USUARIO}',
                    session.userData.dataPersonal.nombreUsuario
                )
            );
        } else if (
            args.flag_no_mostrar_saludo &&
            args.flag_aumentar_contador &&
            args.session_userdata !== false
        ) {
            session.userData = args.session_userdata;
            session.userData.dataProgram.contadorSaludoDinamico =
                session.userData.dataProgram.contadorSaludoDinamico + 1;
            // if (session.userData.dataPersonal.sessionId == "" && !session.userData.dataProgram.sessionActiva) {
            //   session.send(`Para tener una mejor experiencia, puedes iniciar sesión en el siguiente [link](https://secure.falabella.com/falabella-cl/myaccount/includes/loginForm.jsp?successUrl=/).`)
            // }
        } else if (
            args.flag_no_mostrar_saludo &&
            !args.flag_aumentar_contador &&
            args.session_userdata !== false
        ) {
            session.userData = args.session_userdata;
        }
        session.userData.dataProgram.palabraCorta = false;
        let dataPersonal = session.userData.dataPersonal;
        let dataProgram = session.userData.dataProgram;
        // ############################################################### login
        if (!validarFechaSessionActiva(session.userData)) {
            const loginResponse = await login(session.userData);
            if (loginResponse && loginResponse.sessionActiva) {
                session.userData.dataPersonal.emailUsuario = loginResponse.emailUsuario;
                session.userData.dataPersonal.rutUsuario = loginResponse.rutUsuario;
                session.userData.dataProgram.sessionInicial =
                    loginResponse.sessionInicial;
                session.userData.dataProgram.sessionExpira =
                    loginResponse.sessionExpira;
                session.userData.dataProgram.sessionActiva =
                    loginResponse.sessionActiva;
                // session.userData.dataProgram.sessionActiva = true
                console.log('### session activada ####');
            } else {
                
                session.userData.dataPersonal.emailUsuario = ''
                session.userData.dataPersonal.rutUsuario = ''
                session.userData.dataProgram.sessionInicial = ''
                session.userData.dataProgram.sessionExpira = ''
                session.userData.dataProgram.sessionActiva = false
                // if (args.flag_no_mostrar_saludo) {
                //     session.send(`Te invito a que inicies sesión en el siguiente [link](https://secure.falabella.com/falabella-cl/myaccount/includes/loginForm.jsp?successUrl=/) para que tengas una mejor experiencia de consulta.`)
                // }
                console.log('### session no activa ####');
            }
        }
        // ############################################################### login
        session.userData = {};
        session.userData.dataPersonal = dataPersonal;
        session.userData.dataProgram = dataProgram;
        const menuOptions =
            'Seguimiento Orden|Servicios Postventa|Ingreso Solicitud|Información Tiendas|Tengo una pregunta';
        const menuText = '¿En qué te puedo ayudar?';
        builder.Prompts.customize(
            builder.PromptType.choice,
            new builder.PromptChoice({
                recognizeChoices: true, // Deshabilita los botones
                recognizeNumbers: false, // Deshabilita los números
                recognizeOrdinals: false, // Deshabilita los ordinales (el primero, el último, etc)
                minScore: 0.5
            })
        );
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 0
        });

        //logica mensaje despacho en ruta
        // if (session.userData.dataPersonal.rutUsuario != '') {
        //     let rutUsuario = session.userData.dataPersonal.rutUsuario
        //     rutUsuario = rutUsuario.substr(0, rutUsuario.length - 1) + '-' + rutUsuario.substr(rutUsuario.length - 1);
        //     let msnEnRuta = await ENRUTA.sericeOcEnRuta(rutUsuario)
        //     if (msnEnRuta != null) {
        //         session.send(msnEnRuta)
        //     }
        // }
        //fin logica mensaje despacho en ruta
    },

    async (session, results, next) => {
        if (!results.resumed) {
            switch (results.response.entity) {
                case 'Seguimiento Orden':
                    session.userData.ingresoPor = 'Seguimiento Orden'
                    session.beginDialog('/informacion_orden_compra')
                    break
                case 'Servicios Postventa':
                    session.userData.ingresoPor = 'Servicios Postventa'
                    session.beginDialog('/informacion_postventa')
                    break
                case 'Ingreso Solicitud':
                    session.userData.ingresoPor = 'Ingreso Solicitud'
                    session.beginDialog('/ingreso_reclamo')
                    break
                case 'Información Tiendas':
                    session.userData.ingresoPor = 'Información Tiendas'
                    session.beginDialog('/ubicacion_tienda')
                    break
                case 'Tengo una pregunta':
                    session.userData.ingresoPor = 'Tengo una pregunta'
                    session.beginDialog('/tengo_una_pregunta')
                    break
            }
        } else {
            const intentType = await new Promise(async resolve => {
                resolve(await connectionApiLuis.existsInLUIS(session.message.text));
            });
            var cobro_tarjeta_externa = 'n3_error_cobro_tarjeta_externa';
            var cobro_tarjeta_cmr = 'n3_error_cobro_tarjeta_cmr';
            if (
                cobro_tarjeta_externa === intentType.toLowerCase() ||
                cobro_tarjeta_cmr === intentType.toLowerCase()
            ) {
                session.beginDialog('/none');
            } else {
                session.beginDialog(`/${intentType.toLowerCase()}`);
            }
        }
    }
])