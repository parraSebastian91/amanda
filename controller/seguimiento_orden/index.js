module.exports = {
  async createSSTotalEntregaFalso(session) {
    session.userData.nivel1 = 'Despachos'
    session.userData.nivel2 = 'Incumplimiento de fecha'
    session.userData.nivel3 = 'Incumplimiento fecha Entrega'
    session.userData.mediopago = await CONTROLLER.obtenerMetodoPago(session, session.userData.orden_compra, session.userData.email)
    session.userData.motivo_reclamo = 'Posible Total Entrega Falso'
    session.userData.motivo = ''
    let resultCreateSSporIncumplimiento = await CONTROLLER.subOrdenCreateSS(session.userData.arraySubOrdenesConTotalEntregaFalso, session.userData.currentClientInfo, session)
    return resultCreateSSporIncumplimiento
  }
}