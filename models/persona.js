module.exports = class persona {
  constructor(nombre) {
    this.nombre = nombre || ''
    this.rut = ''
    this.existe = false
    this.apellidoPaterno = ''
    this.nacionalidad = ''
    this.contador = 0
  }
}