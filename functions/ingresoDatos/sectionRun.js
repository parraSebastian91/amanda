// *****************************************************************
// *                        Solo para reclamos                     *
// *****************************************************************

require('./../saludos')
require('./../../dialogs/solicitud_callback_general')
const validacionRut = require('./../validaciones/rut')

bot.dialog('/sectionRun', [
    (session, args) => {
        session.userData.rut = ''
        session.userData.dataProgram.palabraCorta = true
        if (typeof args !== 'undefined' && args.retry && args.retryNumber > 1) {
            const menuOptions = 'SI|NO'
            const menuText = '$Ingreso_rut_forma_incorrecta_2$ ¿Deseas intentar ingresar nuevamente tu RUT?'
            session.userData.flagChoice = true
            builder.Prompts.choice(session, menuText, menuOptions, {
                listStyle: builder.ListStyle.button,
                maxRetries: 0
            })
        } else if (typeof args !== 'undefined' && args.retry) {
            session.userData.dataProgram.palabraCorta = true
            builder.Prompts.text(
                session, '$Ingreso_rut_forma_incorrecta_1$ Creo que has ingresado tu RUT de forma incorrecta. ¿Me podrías indicar nuevamente tu RUT? (Ejemplo: 12345678-9)')
        } else {
            session.userData.count = 0
            session.userData.retry = false
            session.userData.flagChoice = false
            builder.Prompts.text(
                session, '$ingresar_rut$ ¿Me puedes indicar tu RUT  (Ejemplo: 12345678-9)?')
        }
    },
    async(session, results) => {
        if (!results.resumed) {
            if (session.userData.flagChoice && results.response.entity && results.response.entity === 'SI') {
                session.userData.flagChoice = false
                session.userData.dataProgram.palabraCorta = false
                    //LLAMADA A CALLBACK NORMAL PARA PRUEBA DE FLUJO OPCIONAL
                session.beginDialog('/solicitud_callback_general')

            } else if (session.userData.flagChoice && results.response.entity && results.response.entity === 'NO') {
                session.userData.flagChoice = false
                session.userData.dataProgram.palabraCorta = false
                session.endConversation()
                session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
                return
            } else if (session.userData.flagChoice) {
                session.userData.flagChoice = false
                session.endConversation()
                session.userData.dataProgram.palabraCorta = false
                session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
                return
            }
            session.userData.dataProgram.palabraCorta = true
            const rutValidado = await validacionRut.validateRut(results)

            if (!rutValidado) {
                session.userData.count += 1
                session.userData.retry = true
                session.userData.dataProgram.palabraCorta = false
                session.replaceDialog('/sectionRun', {
                    retry: session.userData.retry,
                    retryNumber: session.userData.count
                })
            } else {
                session.send(`Perfecto, estoy buscando información de tu RUT: ${rutValidado}`)
                const currentClientInfo = await new Promise(resolve => {
                    resolve(SIEBEL.getClientInfo(rutValidado))
                })
                if (currentClientInfo.ClienteDatosConsultarResp) {
                    const existeFlag = currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto[0].existeFlag
                    if (existeFlag === 'No Existe') {
                        session.userData.rut = ''
                        session.send('Lo siento pero no he logrado encontrar información asociada a tu RUT en nuestros sistemas.')
                        session.endConversation()
                        session.userData.dataProgram.palabraCorta = false
                        session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
                    } else {
                        session.userData.count = 0
                        session.userData.retry = false
                        session.userData.flagChoice = false
                        session.userData.rut = results.response.toLowerCase().replace(/[^\w]/g, '')
                        session.userData.dataProgram.palabraCorta = false
                        session.endDialogWithResult(results)
                    }
                }
            }
        } else {
            session.userData.count = 0
            session.userData.retry = false
            session.userData.flagChoice = false
            session.endConversation()
            session.userData.dataProgram.palabraCorta = false
            session.beginDialog('/saludos', { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
        }
    }
])