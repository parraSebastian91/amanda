const listadoObtener = require("../listadoSolicitud/solicitudListadoObtener")
const logger = require('./../../../utils/logger')

const calcularSolicitudListadoObtenerReturnArray = async (rut, orden, suborden, nivel3) => {
  const solicitudListadoObtener = await listadoObtener(orden)
  if (solicitudListadoObtener !== null && typeof solicitudListadoObtener.SolicitudListadoObtenerOutput !== "undefined" && solicitudListadoObtener.SolicitudListadoObtenerOutput !== null && solicitudListadoObtener.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp !== null && solicitudListadoObtener.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener !== null) {
    logger.info(`solicitudListadoObtener, ${JSON.stringify(solicitudListadoObtener)}`)
    const solicitudes = solicitudListadoObtener.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener
    const ssArr = solicitudes.filter((ss) => {
      return (ss.nivel3 === nivel3 && ss.estado === "Abierto")
    }).filter((s) => {
      if (nivel3 === "FC / NC Administrativa") {
        return (s.numeroOC === orden)
      } else if (nivel3 === "Problema con Gift Card") {
        return (s.estado === "Abierto")
      }
      return (s.numeroSubOrden === suborden)
    })
    return ssArr
  }
  logger.error(`solicitudListadoObtener, ${JSON.stringify(solicitudListadoObtener)}`)
  return []
}

module.exports = calcularSolicitudListadoObtenerReturnArray
