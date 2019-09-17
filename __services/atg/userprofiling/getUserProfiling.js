const request = require("request")
const logger = require('./../../../utils/logger')
const atgApiBaseurl = process.env.ATG_API_BASEURL
//const atgApiBaseurl = 'https://www.falabella.com/rest/model/atg'
/**
 * Metodo para consultar usuario logueado
 * @author: Front
 * @version: 1.0.0
 * @param:{jsessionId} Cookie necesaria para el request
 * @returns: Objeto con respuesta, status y un array de errores
 */
const getUserProfiling = async (jsessionId) => {

  try {
    const response = (_response, _success, _error) => {
      const result = {
        response: null,
        success: false,
        error: []
      }
      result.response = _response
      result.success = _success
      if (_error) result.error.push(_error)
      return result
    }
    if (typeof atgApiBaseurl == "undefined" || atgApiBaseurl == "") {
      return response(null, false, "[empty env.ATG_API_BASEURL]")
    }
    if (typeof jsessionId == "undefined" || jsessionId == "") {
      return response(null, false, "[empty jsessionId]")
    }
    const atgBodyData = {
      headers: {
        "Content-Type": "application/json",
        "cookie": `JSESSIONID=${jsessionId}`,
        "User-Agent":"Amanda"
      }
    }
    let isJson = (str) => {
      try {
        return JSON.parse(str);
      } catch (e) {
        return { errors: [{ message: "Error getUserProfiling- No es un JSON" }] };
      }
    }
    const _getUserProfiling = await new Promise((resolve, reject) => {
      request.get(`${atgApiBaseurl}/userprofiling/ProfileActor/profile-success`, atgBodyData,
        (err, res, body) => {
          if (err) reject(err)
          resolve(isJson(body))
        }
      )
    })
    if (_getUserProfiling.errors.length > 0) {
      // logger.error("# Error en el servicio de login #")       // Comentar despues de probar en prd
      return response(null, false, _getUserProfiling.errors)
    }
    // Usuario logueado - OK
    if (_getUserProfiling.user.hasOwnProperty('documentNumber') && _getUserProfiling.user.hasOwnProperty('emailAddress')) {
      return response(_getUserProfiling, true)
    } else {
      //Usuario no logueado
      return response(null, false, "Usuario no logueado.")
    }
  } catch (error) {
    // logger.error(`Error en el servicio - getUserProfiling, ${JSON.stringify(error)}`)  // Comentar despues de probar en prd
    return response(null, false, "Error en el servicio - getUserProfiling")
  }
}
module.exports = getUserProfiling