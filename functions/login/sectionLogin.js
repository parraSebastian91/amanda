const validacion = require("./../../functions/validaciones/rut")
bot.dialog('/sectionLogin', [
    async (session, args, next) => {
        try {
            session.userData.dataProgram.sessionActiva = false
            if (session.userData.dataPersonal.sessionId != "") {
                const loginResponse = await ATG.getUserProfiling(session.userData.dataPersonal.sessionId)
                if (loginResponse.success === false) {
                    console.log(`Error: sectionLogin - Servicio getUserProfiling, resp:success = false, ${loginResponse.error} `) // Comentar despues de probar en prd
                    session.endDialog()
                } else {
                    if (validacion.validarRutConDVFullMatch(loginResponse.response.user.documentNumber)) {
                        session.userData.dataPersonal.emailUsuario = loginResponse.response.user.emailAddress
                        session.userData.dataPersonal.rutUsuario = loginResponse.response.user.documentNumber.trim().toLocaleUpperCase()
                        session.userData.dataProgram.sessionActiva = true//flag session activa
                    }
                    session.endDialog()
                }
            } else {
                // Si sessionId viene vacio continua el flujo.
                console.log("#sectionLogin - [empty sessionId]")
                session.endDialog()
            }
        } catch (err) {
            console.log(err)
            session.endDialog()
        }
    }
])