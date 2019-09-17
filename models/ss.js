const persona = require('./persona')

module.exports = class ss {
  constructor() {
    this.rut = ''
    this.persona = new persona()
    this.ServiceRequest = {
      nivel1: '',
      nivel2: '',
      nivel3: '',
      canal: 'Asistente Virtual',
      descripcion: '',
      numeroBoleta: '',
      medioPago: '',
      fechaCompra: '',
      numeroOrdenCompra: '',
      tiendaOrigen: '',
      terminal: '',
      secuencia: '',
      sku: '',
      numeroSuborden: '',
      Attachment: ''
    }
  }
}