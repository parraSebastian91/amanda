bot.dialog('/menuPalabrasSueltas', [
    (session, args, next) => {
        session.userData.pathIntent = args.menuPalabra.intent
        session.userData.argumento = args.menuPalabra.argumento
        const menuOptions = args.menuPalabra.opcionesMenu
        const menuText = args.menuPalabra.tituloMenu
        builder.Prompts.choice(session, menuText, menuOptions, {
            listStyle: builder.ListStyle.button,
            maxRetries: 0
        })
    },
    async (session, results, next) => {
        let ruta = ''
        if (session.sessionState.callstack.length < 3) {
            ruta = '/saludos'
        } else {
            ruta = session.sessionState.callstack[session.sessionState.callstack.length - 3].id
        }
        ruta = ruta.split(':')[1]
        ruta = (ruta === '/menuPalabrasSueltas') ? '/saludos' : ruta
        ruta = (typeof ruta === 'undefined') ? '/saludos' : ruta
        let nuevaRuta = session.userData.pathIntent
        if (!results.resumed) {
            switch (results.response.entity.toLowerCase()) {
            case 'no':
                if (ruta === '/saludos') {
                    session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
                } else {
                    session.beginDialog(ruta)
                }
                break
            case 'si':
                session.userData.pathIntent = ''
                session.endConversation()
                if (session.userData.argumento === 'textDevolucion') {
                    session.beginDialog(nuevaRuta, { textDevolucion: true })
                } else {
                    session.beginDialog(nuevaRuta)
                }
                break
            case 'seguimiento orden':
                session.beginDialog('/informacion_orden_compra')
                break
            case 'ingreso solicitud':
                session.beginDialog('/ingreso_reclamo')
                break
            }
        } else {
            const intentType = await new Promise(async resolve => {
                resolve(await connectionApiLuis.existsInLUIS(session.message.text))
            })
            var cobro_tarjeta_externa = 'n3_error_cobro_tarjeta_externa';
            var cobro_tarjeta_cmr = 'n3_error_cobro_tarjeta_cmr';
            if (
                cobro_tarjeta_externa === intentType.toLowerCase() ||
                cobro_tarjeta_cmr === intentType.toLowerCase()
            ) {
                session.beginDialog('/none');
            } else {
                session.beginDialog(`/${ intentType.toLowerCase() }`);
            }
        }
    }
])
