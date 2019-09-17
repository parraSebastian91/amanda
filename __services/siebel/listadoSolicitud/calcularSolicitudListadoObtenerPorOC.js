const Enumerable = require("linq")
const listadoObtener = require("../listadoSolicitud/solicitudListadoObtener")
const logger = require('./../../../utils/logger')

const calcularSolicitudListadoObtenerPorOC = async (rut, orden, nivel3) => {
    const solicitudListadoObtener = await listadoObtener(orden)
    if (solicitudListadoObtener !== null && typeof solicitudListadoObtener.SolicitudListadoObtenerOutput !== 'undefined' && solicitudListadoObtener.SolicitudListadoObtenerOutput !== null && solicitudListadoObtener.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp !== null && solicitudListadoObtener.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener !== null) {
        logger.info(`solicitudListadoObtener, ${JSON.stringify(solicitudListadoObtener)}`)
        const solicitudes = solicitudListadoObtener.SolicitudListadoObtenerOutput.SolicitudListadoObtenerResp.SolicitudListadoObtener
        return new Promise(resolve => {
            resolve(
                Enumerable.from(solicitudes)
                    .where(s => s.nivel3 === nivel3 &&
                        s.numeroOC === orden &&
                        s.estado === "Abierto")
                        .select((ss,i) => ( {SsDuplicada :true, numeroSS : ss.numeroSS})).toArray()
            )
        })
    }
    logger.info(`solicitudListadoObtener, ${JSON.stringify(solicitudListadoObtener)}`)
    return new Promise(resolve => {
        resolve({SsDuplicada :false, numeroSS :''}).toArray()
    })
}

module.exports = calcularSolicitudListadoObtenerPorOC