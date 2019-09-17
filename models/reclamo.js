const orden = require('./orden-compra').ordenCompra
const persona = require('./persona')

module.exports.info = class reclamo {
  constructor(rut) {
    this.id = ''
    this.direccion = ''
    this.email = ''
    this.tipoTienda = ''
    this.contador = 0
    this.descripcion = ''
    this.medioPago = ''
    this.orden = new orden()
    this.rutExiste = false
    this.persona = new persona()
    this.productosReclamados = []
    this.numero = '' // numero SS
  }
}