module.exports = {
  validatePhone(results) {
    if (results.response != null && typeof results.response !== 'undefined') {
      let phone = results.response.replace(/([a-zA-Z]|[ !@#$%^&*{}''``´´+\/\\?¿¡<>""~.-])/g, '').trim()
      if (phone.length == 8 || phone.length == 11) { //&& phone.length <= 15 && phone.slice(0, 2) === '56')
        if (phone.slice(0, 2) === '56' && phone.length == 11) {
          return phone
        } else {
          let codPhone = '56' + '9' + phone
          return codPhone
        }
      } else {
        return false
      }
    } else {
      return false
    }
  },
  separatePhone(results) {
    validatePhoneResult = this.validatePhone(results)
    if (validatePhoneResult) {
      let codigoPais = validatePhoneResult.slice(0, 2)
      let codigoArea = validatePhoneResult.slice(2, 4)
      let numero = '';
      if (codigoArea[0] === '9' || codigoArea[0] === '2') { //celular o santiago
        codigoArea = codigoArea[0]
        numero = validatePhoneResult.slice(3)
      } else { //no-celular o no - santiago 
        numero = validatePhoneResult.slice(4)
      }
      return {
        codigoPais: codigoPais,
        codigoArea: codigoArea,
        numero: numero,
        origen: 'Asistente Virtual'
      }
    } else {
      return null
    }
  }
}