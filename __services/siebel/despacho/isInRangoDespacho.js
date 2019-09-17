const Enumerable = require("linq");
const moment = require("moment");
const logger = require('./../../../utils/logger')
const obtenerListado = require("../listadoSolicitud/solicitudListadoObtener");

const isInRangoDespacho = async (rut, orden, suborden, skus, nivel3) => {
  const solicitudListadoObtener = await obtenerListado(orden);
  logger.info(`isInRangoDespacho, ${JSON.stringify(solicitudListadoObtener)}`)
  if (
    solicitudListadoObtener !== null &&
    solicitudListadoObtener.SolicitudListadoObtenerOutput !== null &&
    solicitudListadoObtener.SolicitudListadoObtenerOutput
      .SolicitudListadoObtenerResp !== null &&
    solicitudListadoObtener.SolicitudListadoObtenerOutput
      .SolicitudListadoObtenerResp.SolicitudListadoObtener !== null
  ) {
    const solicitudes =
      solicitudListadoObtener.SolicitudListadoObtenerOutput
        .SolicitudListadoObtenerResp.SolicitudListadoObtener;
    return new Promise(resolve => {
      resolve(
        Enumerable.from(solicitudes)
          .where(
            s =>
              s.nivel3 === nivel3 &&
              s.sku === skus &&
              s.numeroSubOrden === suborden &&
              moment(s.fechaCompromiso) < moment()
          )
          .any()
      );
    });
  }
  return new Promise(resolve => {
    resolve(false);
  });
};

module.exports = isInRangoDespacho;
