const logger = require('./../../utils/logger')
const dialogos = require('./textos')

const normalizarEmail = (email) => {
  return (email) ? email.toLocaleUpperCase().trim() : false
}

const normalizarRut = (rut) => {
  return (rut) ? rut.replace('-', '').trim() : false
}

module.exports = {
  async  validacionRutMailPorOC(userData, validaRut) {
    logger.info('Función, validación rut, email con orden compra ')
    const datosCliente = {
      'datosOK': true,
      'mensaje': '',
      'rutOC': '',
      'telefonoOc': '',
      'email': '',
      'rutCompraValidaOC': ''
    }
    const clienteObtenerDatos = await SIEBEL.datosClientesPorOc(userData.orden_compra)
    if (!clienteObtenerDatos.codigo) {
      datosCliente.rutOC = clienteObtenerDatos.clienteId
      datosCliente.telefonoOc = clienteObtenerDatos.clienteCelular
      datosCliente.email = clienteObtenerDatos.clienteEmail
      datosCliente.rutCompraValidaOC = clienteObtenerDatos.clienteId
    } 
     if (normalizarEmail(clienteObtenerDatos.clienteEmail) !== normalizarEmail(userData.email)) {
      datosCliente.datosOK = false
      datosCliente.mensaje = dialogos.validaRutMailOC_email_oc_no_coincide
    } else if (validaRut && normalizarRut(clienteObtenerDatos.clienteId.toLocaleLowerCase()) !== normalizarRut(userData.rut.toLocaleLowerCase())) {
      datosCliente.datosOK = false
      datosCliente.mensaje = dialogos.validaRutMailOC_rut_oc_no_coincide
    }
    return datosCliente
  }
}
