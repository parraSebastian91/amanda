

const mensajesCreaSSTipologiaNivel3 = require('../../functions/ingresoDatos/mensajesCreacionSSTipologiaNivel3.json')
module.exports = {

  async createSS(userData) {

    const flagDuplicidadSS = await SIEBEL.validarDuplicidadSS(
      userData.orderNumber,
      userData.nivel3
    )
    if (flagDuplicidadSS === false) {
      const currentClientInfo = await new Promise((resolve, reject) => {
        resolve(SIEBEL.getClientInfo(userData.rut))
      })
      const contacto = currentClientInfo.ClienteDatosConsultarResp.ListaDeContactosResponse.Contacto[0]
      userData.nombre = contacto.nombre
      userData.apellidoMaterno = contacto.apellidoMaterno
      userData.apellidoPaterno = contacto.apellidoPaterno
      userData.nacionalidad = contacto.nacionalidad
      const resultCreateSS = await new Promise((resolve, reject) => {
        const info = SIEBEL.simpleFormatInfo(userData)
        resolve(SIEBEL.simpleCreatesSS(info))
      })
      if (resultCreateSS.codigo == 0) {
       // return `Tu solicitud de servicio ha sido ingresada con éxito.<br> El número de tu solicitud es: ${resultCreateSS.srNumber}`
       let reclamoMsgCreaSS = ''
       mensajesCreaSSTipologiaNivel3.forEach(function(element) {
        if (element.tipologia == userData.nivel3 ) {
          reclamoMsgCreaSS += '&bull;' + element.mensaje.replace('$ID_SOLICITUD', resultCreateSS.srNumber) + '<br>'
        }
      })
      return reclamoMsgCreaSS
      } else {
        return resultCreateSS.mensaje
      }

    } else {
      return "Estimado cliente ya tienes una solicitud ingresada por este motivo. Resolveremos tu caso a la brevedad.<br> Gracias por preferir Falabella."
    }
  }
}