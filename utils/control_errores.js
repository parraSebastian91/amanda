const CODIGO = {
    SUCCES: 200,
    ERROR_APLICACION: 500,
    ERROR_SERVICIO: 600,
    ERROR_APLICACION_SESSION_EMPTY: 601
}
const SERVICE = {
    WEBTRACKING: 'webtracking',
    QUIEBRE_BACKOFFICE: 'quiebre_backoffice',
    QUIEBRE_CALLBACK: 'quiebre_callback',
    SERVICIO_GIFTCARD: 'servicio_giftcard',
    SERVICIO_GIFTCARD_BACKOFFICE: 'servicio_giftcard_backoffice',
    SERVICIO_BO_TOCKEN: 'servicio_bo_tocken',
    QUIEBRE_ATENDIDO: 'quiebre_atendido',
    SERVICIO_BO: 'servicio_bo',
    SERVICIO_QUIEBRE_CALLBACK_BACKOFFICE: 'servicio_quiebre_callback_backoffice',
    DATOSTOKENQUIEBRE: 'datostokenquiebre',
    SOLUCION_QUIEBRE_DERIVAR: 'solucion_quiebre_derivar',
    CREASS_INCUMPLIMIENTO_FECHA: 'crea_ss_incumplimiento_fecha_de_entrega_en_sectionARGS',
    CREASS_INCUMPLIMIENTO_FECHA_PTEF: 'crea_ss_incumplimiento_posible_total_entrega_falso_en_sectionArgsIncumplientoFecha',
    CALLBACK_LLAMADO_CLIENTE_SOLICITADO: 'servicio_callback_llamado_cliente_solicitado',
    CALLBACK_LLAMADO_CLIENTE_SOLICITADO_GENERAL: 'servicio_callback_llamado_cliente_solicitado_general',
    CALLBACK_LLAMADO_CLIENTE_SOLICITADO_FEEDBACK_NEGATIVO: 'servicio_callback_llamado_cliente_solicitado_feedback_negativo',
    CALLBACK_LLAMADO_CLIENTE_SOLICITADO_REINCIDENCIAS: 'servicio_callback_llamado_cliente_solicitado_reincidencia',
    CALLBACK_LLAMADO_CLIENTE_SOLICITADO_BK_FINAL: 'servicio_callback_llamado_cliente_solicitado_bk_final',
    CALLBACK_LLAMADO_CLIENTE_SOLICITADO_QUIEBRE_PRODUCTO: 'servicio_callback_llamado_cliente_solicitado_quiebre_producto',
    CALLBACK_LLAMADO_CLIENTE_SOLICITADO_CAMBIO_BOLETA_FACTURA: 'servicio_callback_llamado_cliente_solicitado_cambio_boleta_factura'

}
module.exports = {
    CODIGO,
    SERVICE
}