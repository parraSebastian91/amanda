const persona = require('./persona')

module.exports = class callback {
  constructor() {
    this.rut = ''
    this.telefono = ''
    this.persona = new persona()
    this.ServiceRequest = {
      nombreCtc: '',
      apellidoCtc: '',
      descNegocio: 'Falabella - Chile',
      idTransaccion: undefined,
      documentoCtc: '',
      digitoVer: '',
      tipoDocumento: '1',
      codigoArea: '',
      codigoPais: '',
      contactInfo: '',
      contactInfoType: '',
      mailCh: ''
    }
  }
}