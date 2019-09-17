const Enumerable = require('linq')
const logger = require('./../../../utils/logger')
const listadoObtener = require('../listadoSolicitud/solicitudListadoObtener')

const validarDuplicidadSS = async (rut, nivel3) => {
  const solicitudListadoObtener = await listadoObtener(rut)
  if (solicitudListadoObtener !== null && typeof solicitudListadoObtener.SolicitudListadoObtenerOutput !== 'undefined' && solicitudListadoObtener.SolicitudListadoObtenerOutput !== null && solicitudListadoObtener.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp !== null && solicitudListadoObtener.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener !== null) {
    logger.info(`validarDuplicidadSS, ${JSON.stringify(solicitudListadoObtener)}`)
    const solicitudes = solicitudListadoObtener.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener
    return new Promise((resolve) => {
      resolve(Enumerable.from(solicitudes).where(
        s => (s.nivel3 === nivel3 && s.estado === 'Abierto')
      ).any())
    })
  }
  logger.error(`validarDuplicidadSS, ${JSON.stringify(solicitudListadoObtener)}`)
  return new Promise((resolve) => {
    resolve(false)
  })
}

module.exports = validarDuplicidadSS