const n3_incumplimiento_fecha = require('./n3_incumplimiento_fecha')
const n3_devolucion_no_acredita_tc = require('./n3_devolucion_no_acredita_tc')
// const n3_error_cobro_tarjeta_cmr = require('./n3_error_cobro_tarjeta_cmr')
// const n3_error_cobro_tarjeta_externa = require('./n3_error_cobro_tarjeta_externa')
const n3_garantia_extendida_anulacion = require('./n3_garantia_extendida_anulacion')
const n3_garantia_extendida_utilizar = require('./n3_garantia_extendida_utilizar')
const n3_problema_con_usuario_web_clave = require('./n3_problema_con_usuario_web_clave')
const n3_problema_transportista = require('./n3_problema_transportista')
const n3_envio_mismo_sku = require('./n3_envio_mismo_sku')
const n3_publicidad_enganosa = require('./n3_publicidad_enganosa')
/** 
 * Tipificaciones nivel 3
 */
const tNivel3 = {
  n3_incumplimiento_fecha,
  n3_devolucion_no_acredita_tc,
//   n3_error_cobro_tarjeta_cmr,
//   n3_error_cobro_tarjeta_externa,
  n3_garantia_extendida_anulacion,
  n3_garantia_extendida_utilizar,
  n3_problema_con_usuario_web_clave,
  n3_problema_transportista,
  n3_envio_mismo_sku,
  n3_publicidad_enganosa
}

module.exports = {
  tNivel3
}