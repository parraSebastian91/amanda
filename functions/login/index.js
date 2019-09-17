const validarRutConDVFullMatch = require("./../../functions/validaciones/rut").validarRutConDVFullMatch
const logger = require('./../../utils/logger')
module.exports = {
    async login(userData) {
        try {
            let tiempoExpira = Number(process.env.TIME_OUT_LOCAL_SESSION) //minutos
            let result = {
                sessionExpira: '',
                sessionInicial: '',
                emailUsuario: null,
                rutUsuario: null,
                sessionActiva: false
            }
            if (userData.dataPersonal.sessionId != "") {
                const loginResponse = await ATG.getUserProfiling(userData.dataPersonal.sessionId)
                if (loginResponse.success === false) {
                    logger.error(`sectionLogin - Servicio getUserProfiling, resp:success = false, ${loginResponse.error}`) // Comentar despues de probar en prd
                    return result
                }
                if (validarRutConDVFullMatch(loginResponse.response.user.documentNumber)) {
                    let fechaInicial = new Date()
                    let fechaExpira = new Date(fechaInicial.getTime() + 1000 * 60 * tiempoExpira)
                    result.sessionExpira = fechaExpira.getTime()
                    result.sessionInicial = fechaInicial.getTime()
                    result.emailUsuario = loginResponse.response.user.emailAddress
                    result.rutUsuario = loginResponse.response.user.documentNumber
                    result.sessionActiva = true
                    return result
                }
            } else {
                // Si sessionId viene vacio continua el flujo.
                logger.info("#sectionLogin - [empty sessionId]")
                return result
            }
        } catch (err) {
            logger.error(`Error: sectionLogin - Servicio getUserProfiling; ${err} `)
            result.sessionExpira = ''
            result.sessionInicial = ''
            result.emailUsuario = null
            result.rutUsuario = null
            result.sessionActiva = false
            return result
        }
    }
}