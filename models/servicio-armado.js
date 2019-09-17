const orden = require('./orden-compra').ordenCompra
const persona = require('./persona')

module.exports.info = class servicioArmado {
  constructor(rut) {
    this.id = ''
    this.direccion = ''
    this.email = ''
    this.tipoTienda = ''
    this.contador = 0
    this.persona = new persona()
    this.orden = new orden()
    this.numero = '' // numero SS
  }
}