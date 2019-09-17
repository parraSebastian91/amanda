const moment = require('moment')
module.exports = {
  validarFechaActual(fecha) {
    if (typeof fecha == "undefined" || fecha == null) return false
    let fechaActual = moment().format('YYYY/MM/DD')
    let _fecha = moment().format(fecha)
    if (fechaActual < _fecha) {
      return false
    } else {
      return true
    }
  },
  validarFechaSessionActiva(userData) {
    //Muestra el  tiempo de la session
    const logFechasSession = (fechaInicial, fechaExpira, horaActual) => {
      if (sessionInicial != "" && sessionExpira != "" && horaActual != "") {
        let _fechaExpira = new Date(sessionExpira)
        let _fechaInicial = new Date(sessionInicial)
        console.log(`Hora actual: ${horaActual.getDay()} - ${horaActual.getHours()} - ${horaActual.getMinutes()} `)
        console.log(`_fechaInicial: ${_fechaInicial.getDay()} - ${_fechaInicial.getHours()} - ${_fechaInicial.getMinutes()} `)
        console.log(`_fechaExpira: ${_fechaExpira.getDay()} - ${_fechaExpira.getHours()} - ${_fechaExpira.getMinutes()} `)
      }
    }
    let sessionInicial = userData.dataProgram.sessionInicial
    let sessionExpira = userData.dataProgram.sessionExpira
    let sessionActiva = userData.dataProgram.sessionActiva
    let horaActual = new Date()
    // logFechasSession(sessionInicial, sessionExpira, horaActual)//log
    if (sessionExpira == '' && sessionExpira == '' && sessionActiva === false) {
      console.log("La session esta vacia.")
      return false
    } else if (sessionExpira != '' && (horaActual.getTime() >= sessionExpira) && sessionActiva === true) {
      console.log("La session expiró.")
      return false
    } else if (sessionExpira != '' && (horaActual.getTime() <= sessionExpira) && sessionActiva === true) {
      console.log("La session esta activa.")
      return true
    }
    return false
  }
}