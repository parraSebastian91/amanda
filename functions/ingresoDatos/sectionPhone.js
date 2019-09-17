const validacionFono = require('./../validaciones/telefono.js')
let count = 0
let flagChoice = false
let retry = false
bot.dialog('/sectionPhone', [
  (session, args, next) => {
    session.userData.dataProgram.palabraCorta = true
    if (typeof args != "undefined" && args.retry && args.retryNumber > 1) {
      const menuOptions = `SI|NO`
      const menuText = "¿Deseas intentar nuevamente ingresar el teléfono de la persona que realizó la compra?"
      flagChoice = true
      builder.Prompts.choice(session, menuText, menuOptions,
        { listStyle: builder.ListStyle.button, maxRetries: 0 })
    } else if (typeof args != "undefined" && args.retry) {
      builder.Prompts.text(
        session, "¿Me podrías indicar algún teléfono de contacto para comunicarnos contigo? (Ejemplo: 569XXXXXXXX)")
    } else {
      count = 0
      retry = false
      flagChoice = false

      builder.Prompts.text(session, "¿Me podrías indicar algún teléfono de contacto para comunicarnos contigo? (Ejemplo: 569XXXXXXXX)")
    }
  },
  async (session, results, next) => {
    if (!results.resumed) {
      if (flagChoice && results.response.entity && results.response.entity === "SI") {
        flagChoice = false
        retry = true
        session.replaceDialog("/sectionPhone", {
          retry: retry
        })
      } else if (flagChoice && results.response.entity && results.response.entity === "NO") {
        flagChoice = false
        session.endConversation()
        session.userData.dataProgram.palabraCorta = false
        session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
        return
      } else if (flagChoice) {
        flagChoice = false
        session.endConversation()
        session.userData.dataProgram.palabraCorta = false
        session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
        return
      }

      const fonoExits = await validacionFono.validatePhone(results)

      if (!fonoExits) {
        count += 1
        retry = true
        session.replaceDialog("/sectionPhone", {
          retry: retry,
          retryNumber: count
        })
      } else {
        count = 0
        retry = false
        flagChoice = false
        session.userData.telefono = ''
        session.userData.telefono = results.response
        session.userData.dataProgram.palabraCorta = false
        session.endDialogWithResult()
      }
    } else {
      count = 0
      retry = false
      flagChoice = false
      session.endConversation()
      session.userData.dataProgram.palabraCorta = false
      session.beginDialog("/saludos", { flag_no_mostrar_saludo: false, flag_aumentar_contador: true, session_userdata: session.userData })
    }
  }
])