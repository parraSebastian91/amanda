module.exports = class producto {
  constructor(nombre) {
    this.nombre = nombre || ''
    this.marca = ''
    this.tipo = ''
    this.color = ''
    this.talla = ''
    this.uso = ''
    this.material = ''
    this.medidas = ''
    this.contador = 0
  }
}