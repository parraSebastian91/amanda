module.exports = {
  validateRut(results) {
    if (results.response != null && typeof results.response !== 'undefined') {
      const rut = results.response.replace(/([a-jA-J]|[!@#$%^&*{}''``´´+\/\\?¿¡<>""~.-]|[l-zL-Z])/g, '').trim()
      if (rut.length <= 9 && rut.length >= 8) {
        let digitoVerificadorIngresado = rut.slice(rut.length - 1) + ''
        let digitoVerificadorCalculado = this.calculateDigitoVerificador(rut.slice(0, rut.length - 1))
        if (digitoVerificadorIngresado.toUpperCase() == digitoVerificadorCalculado) {
          return ([rut.slice(0, rut.length - 1), '-', rut.slice(rut.length - 1)].join('')).toUpperCase()
        } else {
          return false
        }
      }
      return false
    } else {
      return false
    }
  },
  formatRut(rut) {
    if (rut != null && typeof rut !== 'undefined' && rut != '') {
      const result = rut.replace(/-/g, '').replace(/\./g, '')
      return [result.slice(0, -1), result.slice(-1)]
    } else {
      return false
    }
  },
  siebelFormatDocument(rut) {
    if (rut != null && typeof rut !== 'undefined' && rut != '') {
      const formatRut = this.formatRut(rut)
      if (formatRut.length === 2) {
        let digitoVerificador = formatRut[1].toUpperCase()
        return {
          tipo: '1',
          numero: formatRut[0].slice(-1),
          digitoVerificador: digitoVerificador
        }
      } else {
        return {
          tipo: '1',
          numero: '',
          digitoVerificador: ''
        }
      }
    } else {
      return false
    }
  },
  calculateDigitoVerificador(rut_sin_dv) {
    if (rut_sin_dv == null || typeof rut_sin_dv === 'undefined') {
      return false
    }
    rut_sin_dv = rut_sin_dv + ''
    let secuencia = [2, 3, 4, 5, 6, 7, 2, 3]
    let sum = 0
    for (let i = rut_sin_dv.length - 1; i >= 0; i--) {
      let d = rut_sin_dv.charAt(i)
      sum += new Number(d) * secuencia[rut_sin_dv.length - (i + 1)]
    }
    let rest = 11 - (sum % 11)
    return rest === 11 ? 0 : rest === 10 ? 'K' : rest
  },
  /**
* Valida si viene un rut numerico o con k.
* Se ocupa para validar el rut en sectionLogin
* @author: Front
* @version: 1.0.0
* @param:{strRut}
* @returns: Boolean
*/
  validarRutConDVFullMatch(strRut) {
    try {
      if (strRut == "") return false
      var reg = /\d+[0-9]{7,8}[kK$]?/
      var result = strRut.match(reg)
      return result != null && result[0].length == result.input.length
    } catch (error) {
      return false
    }
  }
}